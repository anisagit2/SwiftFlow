import { FieldValue } from "firebase-admin/firestore";

import { createSeedState } from "../data/seedState.js";
import { clone, buildCarpoolBookingPayload, buildSnapshot } from "../services/buildAppState.js";
import { db } from "../services/firebaseAdmin.js";
import { addMinutes, syncDerivedTimes } from "../utils/time.js";
import {
    USERS_COLLECTION,
    buildBusFare,
    buildConfirmationCode,
    buildCreditTransaction,
    buildExpiredBooking,
    buildMockPaymentStatus,
    buildMockQueuedPaymentStatus,
    buildProfileReadModel,
    buildReminderAlert,
    buildRewardRedemption,
    buildRouteGate,
    buildTrainFare,
    buildTripHistoryEntry,
    currentTimestamp,
    decorateBusBooking,
    decorateTrainBooking,
    decrementSeatsLabel,
    ensureOption,
    isPastDepartureGrace,
    normalizeState,
    pushCreditActivity,
    toReadableDate,
    updateRouteWindow,
} from "./firebaseStoreHelpers.js";

const getRefs = (userId) => {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);

    return {
        userRef,
        profileRef: userRef,
        tripRef: userRef.collection("trips").doc("active"),
        trainBookingRef: userRef.collection("bookings").doc("train"),
        busBookingRef: userRef.collection("bookings").doc("bus"),
        carpoolRef: userRef.collection("transport").doc("carpool"),
        walletRef: userRef.collection("wallets").doc("credits"),
        catalogRef: userRef.collection("meta").doc("catalog"),
        profileReadRef: userRef.collection("readModels").doc("profile"),
        checkInRef: userRef.collection("readModels").doc("checkIn"),
        alertsRef: userRef.collection("readModels").doc("alerts"),
        tripHistoryCollectionRef: userRef.collection("tripHistory"),
        creditTransactionsCollectionRef: userRef.collection("creditTransactions"),
        rewardRedemptionsCollectionRef: userRef.collection("rewardRedemptions"),
    };
};

const decomposeState = (state, user) => ({
    profile: {
        userId: user.userId,
        email: user.email ?? null,
        displayName: user.displayName ?? user.email ?? "SwiftFlow User",
        photoURL: user.photoURL ?? null,
        activeTripId: "active",
        updatedAt: FieldValue.serverTimestamp(),
    },
    trip: {
        origin: state.booking.origin,
        destination: state.booking.destination,
        departureTime: state.booking.departureTime,
        routeMode: state.routeMode,
        routeGate: state.routeGate,
        routeWindow: state.routeWindow,
        activeTab: state.activeTab,
        countdownSeconds: state.countdownSeconds,
        checkInAccepted: state.checkInAccepted,
        passReady: state.passReady,
        alertOriginalTime: state.alertOriginalTime,
        alertSuggestedTime: state.alertSuggestedTime,
        alertAccepted: state.alertAccepted,
        updatedAt: FieldValue.serverTimestamp(),
    },
    trainBooking: decorateTrainBooking(clone(state.booking)),
    busBooking: decorateBusBooking(clone(state.busBooking)),
    carpool: {
        drivers: clone(state.carpoolDrivers),
        selectedDriverId: state.selectedCarpoolDriverId,
        booking: clone(state.carpoolBooking),
        updatedAt: FieldValue.serverTimestamp(),
    },
    wallet: {
        balance: state.balance,
        rank: state.rank,
        ecoSaved: state.ecoSaved,
        goalCredits: state.goalCredits,
        recentCredits: clone(state.recentCredits),
        updatedAt: FieldValue.serverTimestamp(),
    },
    catalog: {
        locationOptions: clone(state.locationOptions),
        trainTimeOptions: clone(state.trainTimeOptions),
        busTimeOptions: clone(state.busTimeOptions),
        carpoolPaymentOptions: clone(state.carpoolPaymentOptions),
        trainPaymentOptions: clone(state.trainPaymentOptions),
        busPaymentOptions: clone(state.busPaymentOptions),
        rewards: clone(state.rewards),
        updatedAt: FieldValue.serverTimestamp(),
    },
    profileRead: clone(state.profileDetails),
    checkInRead: clone(state.checkInDetails),
    alertsRead: clone(state.alertDetails),
});

const composeState = (docs) => {
    const state = createSeedState();

    const trip = docs.trip.data();
    const trainBooking = docs.trainBooking.data();
    const busBooking = docs.busBooking.data();
    const carpool = docs.carpool.data();
    const wallet = docs.wallet.data();
    const catalog = docs.catalog.data();
    const profileRead = docs.profileRead?.data?.() ?? state.profileDetails;
    const checkInRead = docs.checkInRead?.data?.() ?? state.checkInDetails;
    const alertsRead = docs.alertsRead?.data?.() ?? state.alertDetails;
    const tripHistory = docs.tripHistory?.docs?.map((doc) => doc.data()) ?? [];
    const creditLedger = docs.creditTransactions?.docs?.map((doc) => doc.data()) ?? [];
    const rewardRedemptions = docs.rewardRedemptions?.docs?.map((doc) => doc.data()) ?? [];

    Object.assign(state, {
        routeMode: trip.routeMode,
        routeGate: trip.routeGate,
        routeWindow: trip.routeWindow,
        activeTab: trip.activeTab,
        countdownSeconds: trip.countdownSeconds,
        checkInAccepted: trip.checkInAccepted,
        passReady: trip.passReady,
        alertOriginalTime: trip.alertOriginalTime,
        alertSuggestedTime: trip.alertSuggestedTime,
        alertAccepted: trip.alertAccepted,
        booking: decorateTrainBooking(trainBooking),
        busBooking: decorateBusBooking(busBooking),
        carpoolDrivers: carpool.drivers,
        selectedCarpoolDriverId: carpool.selectedDriverId,
        carpoolBooking: carpool.booking,
        balance: wallet.balance,
        rank: wallet.rank,
        ecoSaved: wallet.ecoSaved,
        goalCredits: wallet.goalCredits,
        recentCredits: wallet.recentCredits,
        locationOptions: catalog.locationOptions,
        trainTimeOptions: catalog.trainTimeOptions,
        busTimeOptions: catalog.busTimeOptions,
        carpoolPaymentOptions: catalog.carpoolPaymentOptions,
        trainPaymentOptions: catalog.trainPaymentOptions,
        busPaymentOptions: catalog.busPaymentOptions,
        rewards: catalog.rewards,
        profileDetails: profileRead,
        tripHistory,
        checkInDetails: checkInRead,
        alertDetails: alertsRead,
        creditLedger,
        rewardRedemptions,
    });

    return normalizeState(state);
};

const seedUserDocuments = async (refs, user) => {
    const seedState = normalizeState(createSeedState());
    const docs = decomposeState(seedState, user);
    const batch = db.batch();

    batch.set(refs.profileRef, {
        ...docs.profile,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    batch.set(refs.tripRef, docs.trip);
    batch.set(refs.trainBookingRef, docs.trainBooking);
    batch.set(refs.busBookingRef, docs.busBooking);
    batch.set(refs.carpoolRef, docs.carpool);
    batch.set(refs.walletRef, docs.wallet);
    batch.set(refs.catalogRef, docs.catalog);
    batch.set(refs.profileReadRef, buildProfileReadModel(seedState, user, null, []));
    batch.set(refs.checkInRef, docs.checkInRead);
    batch.set(refs.alertsRef, docs.alertsRead);

    await batch.commit();
    return seedState;
};

export const createAppStore = () => {
    const loadState = async (user) => {
        const refs = getRefs(user.userId);
        const [profile, trip, trainBooking, busBooking, carpool, wallet, catalog, profileRead, checkInRead, alertsRead, tripHistory, creditTransactions, rewardRedemptions] = await Promise.all([
            refs.profileRef.get(),
            refs.tripRef.get(),
            refs.trainBookingRef.get(),
            refs.busBookingRef.get(),
            refs.carpoolRef.get(),
            refs.walletRef.get(),
            refs.catalogRef.get(),
            refs.profileReadRef.get(),
            refs.checkInRef.get(),
            refs.alertsRef.get(),
            refs.tripHistoryCollectionRef.orderBy("recordedAt", "desc").limit(5).get(),
            refs.creditTransactionsCollectionRef.orderBy("recordedAt", "desc").limit(10).get(),
            refs.rewardRedemptionsCollectionRef.orderBy("redeemedAt", "desc").limit(10).get(),
        ]);

        const docs = { profile, trip, trainBooking, busBooking, carpool, wallet, catalog, profileRead, checkInRead, alertsRead, tripHistory, creditTransactions, rewardRedemptions };

        if (!profile.exists || !trip.exists || !trainBooking.exists || !busBooking.exists || !carpool.exists || !wallet.exists || !catalog.exists) {
            return seedUserDocuments(refs, user);
        }

        await refs.profileRef.set({
            email: user.email ?? null,
            displayName: user.displayName ?? user.email ?? "SwiftFlow User",
            photoURL: user.photoURL ?? null,
            lastLoginAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        return composeState(docs);
    };

    const saveState = async (user, state) => {
        normalizeState(state);
        const refs = getRefs(user.userId);
        const docs = decomposeState(state, user);
        const batch = db.batch();
        const memberSince = toReadableDate(state.profileDetails?.memberSince) ?? toReadableDate(currentTimestamp());

        batch.set(refs.profileRef, {
            ...docs.profile,
            lastLoginAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        batch.set(refs.tripRef, docs.trip);
        batch.set(refs.trainBookingRef, docs.trainBooking);
        batch.set(refs.busBookingRef, docs.busBooking);
        batch.set(refs.carpoolRef, docs.carpool);
        batch.set(refs.walletRef, docs.wallet);
        batch.set(refs.catalogRef, docs.catalog);
        batch.set(refs.profileReadRef, buildProfileReadModel(state, user, memberSince, state.tripHistory ?? []));
        batch.set(refs.checkInRef, docs.checkInRead);
        batch.set(refs.alertsRef, docs.alertsRead);

        await batch.commit();
    };

    const buildTransactionalState = ({ seedState, user, profileDoc, profileRead, trip, booking, busBooking, catalog, tripHistory, checkInRead, alertsRead, creditLedger, rewardRedemptions }) =>
        normalizeState({
            ...seedState,
            ...trip,
            booking,
            busBooking,
            carpoolDrivers: seedState.carpoolDrivers,
            selectedCarpoolDriverId: seedState.selectedCarpoolDriverId,
            carpoolBooking: seedState.carpoolBooking,
            balance: seedState.balance,
            rank: seedState.rank,
            ecoSaved: seedState.ecoSaved,
            goalCredits: seedState.goalCredits,
            recentCredits: seedState.recentCredits,
            locationOptions: catalog.locationOptions,
            trainTimeOptions: catalog.trainTimeOptions,
            busTimeOptions: catalog.busTimeOptions,
            carpoolPaymentOptions: catalog.carpoolPaymentOptions,
            trainPaymentOptions: catalog.trainPaymentOptions,
            busPaymentOptions: catalog.busPaymentOptions,
            rewards: catalog.rewards,
            profileDetails: {
                ...profileRead,
                displayName: user.displayName ?? user.email ?? profileRead.displayName ?? "SwiftFlow User",
                email: user.email ?? profileDoc.email ?? null,
                photoURL: user.photoURL ?? profileDoc.photoURL ?? null,
            },
            tripHistory,
            checkInDetails: checkInRead ?? seedState.checkInDetails,
            alertDetails: alertsRead ?? seedState.alertDetails,
            creditLedger: creditLedger ?? seedState.creditLedger,
            rewardRedemptions: rewardRedemptions ?? seedState.rewardRedemptions,
        });

    const persistTrainBookingState = async (user, updater) => {
        await loadState(user);
        const refs = getRefs(user.userId);

        return db.runTransaction(async (transaction) => {
            const [profileSnap, tripSnap, trainBookingSnap, busBookingSnap, catalogSnap, profileReadSnap, checkInSnap, alertsSnap, tripHistorySnap, creditTransactionsSnap, rewardRedemptionsSnap] = await Promise.all([
                transaction.get(refs.profileRef),
                transaction.get(refs.tripRef),
                transaction.get(refs.trainBookingRef),
                transaction.get(refs.busBookingRef),
                transaction.get(refs.catalogRef),
                transaction.get(refs.profileReadRef),
                transaction.get(refs.checkInRef),
                transaction.get(refs.alertsRef),
                transaction.get(refs.tripHistoryCollectionRef.orderBy("recordedAt", "desc").limit(5)),
                transaction.get(refs.creditTransactionsCollectionRef.orderBy("recordedAt", "desc").limit(10)),
                transaction.get(refs.rewardRedemptionsCollectionRef.orderBy("redeemedAt", "desc").limit(10)),
            ]);

            const seedState = createSeedState();
            const profileDoc = profileSnap.data() ?? {};
            const booking = decorateTrainBooking(trainBookingSnap.data() ?? seedState.booking);
            const trip = tripSnap.data() ?? {};
            const busBooking = busBookingSnap.data() ?? seedState.busBooking;
            const catalog = catalogSnap.data() ?? {};
            const profileRead = profileReadSnap.data() ?? seedState.profileDetails;
            const tripHistory = tripHistorySnap.docs.map((doc) => doc.data());
            const checkInRead = checkInSnap.data() ?? seedState.checkInDetails;
            const alertsRead = alertsSnap.data() ?? seedState.alertDetails;
            const creditLedger = creditTransactionsSnap.docs.map((doc) => doc.data());
            const rewardRedemptions = rewardRedemptionsSnap.docs.map((doc) => doc.data());

            const state = buildTransactionalState({
                seedState,
                user,
                profileDoc,
                profileRead,
                trip,
                booking,
                busBooking,
                catalog,
                tripHistory,
                checkInRead,
                alertsRead,
                creditLedger,
                rewardRedemptions,
            });

            const result = updater(state);
            const docs = decomposeState(state, user);
            const memberSince = profileRead.memberSince ?? toReadableDate(currentTimestamp());

            transaction.set(refs.trainBookingRef, docs.trainBooking);
            transaction.set(refs.tripRef, docs.trip, { merge: true });
            transaction.set(refs.busBookingRef, {
                origin: state.busBooking.origin,
                destination: state.busBooking.destination,
                updatedAt: currentTimestamp(),
            }, { merge: true });
            transaction.set(refs.profileReadRef, buildProfileReadModel(state, user, memberSince, state.tripHistory ?? []), { merge: true });
            transaction.set(refs.checkInRef, state.checkInDetails, { merge: true });
            transaction.set(refs.alertsRef, state.alertDetails, { merge: true });
            const latestTrainHistory = state.tripHistory?.find((entry) => entry.bookingId === state.booking.id);
            if (latestTrainHistory) {
                transaction.set(refs.tripHistoryCollectionRef.doc(latestTrainHistory.id), latestTrainHistory);
            }

            return result;
        });
    };

    const persistBusBookingState = async (user, updater) => {
        await loadState(user);
        const refs = getRefs(user.userId);

        return db.runTransaction(async (transaction) => {
            const [profileSnap, tripSnap, trainBookingSnap, busBookingSnap, catalogSnap, profileReadSnap, checkInSnap, alertsSnap, tripHistorySnap, creditTransactionsSnap, rewardRedemptionsSnap] = await Promise.all([
                transaction.get(refs.profileRef),
                transaction.get(refs.tripRef),
                transaction.get(refs.trainBookingRef),
                transaction.get(refs.busBookingRef),
                transaction.get(refs.catalogRef),
                transaction.get(refs.profileReadRef),
                transaction.get(refs.checkInRef),
                transaction.get(refs.alertsRef),
                transaction.get(refs.tripHistoryCollectionRef.orderBy("recordedAt", "desc").limit(5)),
                transaction.get(refs.creditTransactionsCollectionRef.orderBy("recordedAt", "desc").limit(10)),
                transaction.get(refs.rewardRedemptionsCollectionRef.orderBy("redeemedAt", "desc").limit(10)),
            ]);

            const seedState = createSeedState();
            const profileDoc = profileSnap.data() ?? {};
            const booking = decorateTrainBooking(trainBookingSnap.data() ?? seedState.booking);
            const busBooking = decorateBusBooking(busBookingSnap.data() ?? seedState.busBooking);
            const trip = tripSnap.data() ?? {};
            const catalog = catalogSnap.data() ?? {};
            const profileRead = profileReadSnap.data() ?? seedState.profileDetails;
            const tripHistory = tripHistorySnap.docs.map((doc) => doc.data());
            const checkInRead = checkInSnap.data() ?? seedState.checkInDetails;
            const alertsRead = alertsSnap.data() ?? seedState.alertDetails;
            const creditLedger = creditTransactionsSnap.docs.map((doc) => doc.data());
            const rewardRedemptions = rewardRedemptionsSnap.docs.map((doc) => doc.data());

            const state = buildTransactionalState({
                seedState,
                user,
                profileDoc,
                profileRead,
                trip,
                booking,
                busBooking,
                catalog,
                tripHistory,
                checkInRead,
                alertsRead,
                creditLedger,
                rewardRedemptions,
            });

            const result = updater(state);
            const docs = decomposeState(state, user);
            const memberSince = profileRead.memberSince ?? toReadableDate(currentTimestamp());

            transaction.set(refs.busBookingRef, docs.busBooking);
            transaction.set(refs.tripRef, docs.trip, { merge: true });
            transaction.set(refs.trainBookingRef, {
                origin: state.booking.origin,
                destination: state.booking.destination,
                updatedAt: currentTimestamp(),
            }, { merge: true });
            transaction.set(refs.profileReadRef, buildProfileReadModel(state, user, memberSince, state.tripHistory ?? []), { merge: true });
            transaction.set(refs.checkInRef, state.checkInDetails, { merge: true });
            transaction.set(refs.alertsRef, state.alertDetails, { merge: true });

            const latestBusHistory = state.tripHistory?.find((entry) => entry.bookingId === state.busBooking.id);
            if (latestBusHistory) {
                transaction.set(refs.tripHistoryCollectionRef.doc(latestBusHistory.id), latestBusHistory);
            }

            return result;
        });
    };

    const persistExperienceState = async (user, updater) => {
        await loadState(user);
        const refs = getRefs(user.userId);

        return db.runTransaction(async (transaction) => {
            const [profileSnap, tripSnap, trainBookingSnap, busBookingSnap, carpoolSnap, walletSnap, catalogSnap, profileReadSnap, checkInSnap, alertsSnap, tripHistorySnap, creditTransactionsSnap, rewardRedemptionsSnap] = await Promise.all([
                transaction.get(refs.profileRef),
                transaction.get(refs.tripRef),
                transaction.get(refs.trainBookingRef),
                transaction.get(refs.busBookingRef),
                transaction.get(refs.carpoolRef),
                transaction.get(refs.walletRef),
                transaction.get(refs.catalogRef),
                transaction.get(refs.profileReadRef),
                transaction.get(refs.checkInRef),
                transaction.get(refs.alertsRef),
                transaction.get(refs.tripHistoryCollectionRef.orderBy("recordedAt", "desc").limit(5)),
                transaction.get(refs.creditTransactionsCollectionRef.orderBy("recordedAt", "desc").limit(10)),
                transaction.get(refs.rewardRedemptionsCollectionRef.orderBy("redeemedAt", "desc").limit(10)),
            ]);

            const seedState = createSeedState();
            const profileDoc = profileSnap.data() ?? {};
            const trip = tripSnap.data() ?? {};
            const booking = decorateTrainBooking(trainBookingSnap.data() ?? seedState.booking);
            const busBooking = decorateBusBooking(busBookingSnap.data() ?? seedState.busBooking);
            const carpool = carpoolSnap.data() ?? { drivers: seedState.carpoolDrivers, selectedDriverId: seedState.selectedCarpoolDriverId, booking: seedState.carpoolBooking };
            const wallet = walletSnap.data() ?? {};
            const catalog = catalogSnap.data() ?? {};
            const profileRead = profileReadSnap.data() ?? seedState.profileDetails;
            const checkInRead = checkInSnap.data() ?? seedState.checkInDetails;
            const alertsRead = alertsSnap.data() ?? seedState.alertDetails;
            const tripHistory = tripHistorySnap.docs.map((doc) => doc.data());
            const creditLedger = creditTransactionsSnap.docs.map((doc) => doc.data());
            const rewardRedemptions = rewardRedemptionsSnap.docs.map((doc) => doc.data());

            const state = normalizeState({
                ...seedState,
                ...trip,
                booking,
                busBooking,
                carpoolDrivers: carpool.drivers ?? seedState.carpoolDrivers,
                selectedCarpoolDriverId: carpool.selectedDriverId ?? seedState.selectedCarpoolDriverId,
                carpoolBooking: carpool.booking ?? seedState.carpoolBooking,
                balance: wallet.balance ?? seedState.balance,
                rank: wallet.rank ?? seedState.rank,
                ecoSaved: wallet.ecoSaved ?? seedState.ecoSaved,
                goalCredits: wallet.goalCredits ?? seedState.goalCredits,
                recentCredits: wallet.recentCredits ?? seedState.recentCredits,
                locationOptions: catalog.locationOptions,
                trainTimeOptions: catalog.trainTimeOptions,
                busTimeOptions: catalog.busTimeOptions,
                carpoolPaymentOptions: catalog.carpoolPaymentOptions,
                trainPaymentOptions: catalog.trainPaymentOptions,
                busPaymentOptions: catalog.busPaymentOptions,
                rewards: catalog.rewards,
                profileDetails: {
                    ...profileRead,
                    displayName: user.displayName ?? user.email ?? profileRead.displayName ?? "SwiftFlow User",
                    email: user.email ?? profileDoc.email ?? null,
                    photoURL: user.photoURL ?? profileDoc.photoURL ?? null,
                },
                checkInDetails: checkInRead,
                alertDetails: alertsRead,
                tripHistory,
                creditLedger,
                rewardRedemptions,
            });

            const result = updater(state);
            const docs = decomposeState(state, user);
            const memberSince = profileRead.memberSince ?? toReadableDate(currentTimestamp());

            transaction.set(refs.profileRef, {
                ...docs.profile,
                lastLoginAt: FieldValue.serverTimestamp(),
            }, { merge: true });
            transaction.set(refs.tripRef, docs.trip, { merge: true });
            transaction.set(refs.trainBookingRef, docs.trainBooking, { merge: true });
            transaction.set(refs.busBookingRef, docs.busBooking, { merge: true });
            transaction.set(refs.carpoolRef, docs.carpool, { merge: true });
            transaction.set(refs.walletRef, docs.wallet, { merge: true });
            transaction.set(refs.catalogRef, docs.catalog, { merge: true });
            transaction.set(refs.profileReadRef, buildProfileReadModel(state, user, memberSince, state.tripHistory ?? []), { merge: true });
            transaction.set(refs.checkInRef, state.checkInDetails, { merge: true });
            transaction.set(refs.alertsRef, state.alertDetails, { merge: true });

            const latestCredit = state.creditLedger?.[0];
            if (latestCredit) {
                transaction.set(refs.creditTransactionsCollectionRef.doc(latestCredit.id), latestCredit);
            }

            const latestRedemption = state.rewardRedemptions?.[0];
            if (latestRedemption) {
                transaction.set(refs.rewardRedemptionsCollectionRef.doc(latestRedemption.id), latestRedemption);
            }

            return result;
        });
    };

    const mutateState = async (user, handler) => {
        const state = await loadState(user);
        const result = await handler(state);
        await saveState(user, state);
        return result;
    };

    return {
        async expirePastTickets({ graceMinutes = 5 } = {}) {
            const snapshot = await db.collectionGroup("bookings")
                .where("confirmed", "==", true)
                .where("reservationStatus", "==", "confirmed")
                .get();
            const batch = db.batch();
            const expired = [];

            snapshot.docs.forEach((doc) => {
                const booking = doc.data();
                if (!isPastDepartureGrace(booking.departureTime, graceMinutes)) {
                    return;
                }

                const expiredBooking = buildExpiredBooking(booking);
                const userRef = doc.ref.parent.parent;
                batch.set(doc.ref, expiredBooking, { merge: true });
                if (userRef) {
                    batch.set(userRef.collection("readModels").doc("alerts"), {
                        status: "ticket_expired",
                        incidentType: "ticket_lifecycle",
                        title: `${booking.type === "bus" ? "Bus" : "RTS"} ticket expired`,
                        message: `The ${booking.type === "bus" ? "bus" : "RTS"} ticket for ${booking.departureTime} is now expired.`,
                        updatedAt: expiredBooking.expiredAt,
                    }, { merge: true });
                }
                expired.push({
                    userId: userRef?.id ?? null,
                    bookingType: booking.type ?? doc.id,
                    bookingId: booking.id ?? doc.id,
                    departureTime: booking.departureTime,
                });
            });

            if (expired.length) {
                await batch.commit();
            }

            return {
                expiredCount: expired.length,
                expired,
            };
        },

        async expireTicket(user, bookingType, input = {}) {
            if (!user?.userId) {
                throw new Error("userId is required.");
            }

            if (!["train", "bus"].includes(bookingType)) {
                throw new Error("bookingType must be train or bus.");
            }

            const refs = getRefs(user.userId);
            const bookingRef = bookingType === "bus" ? refs.busBookingRef : refs.trainBookingRef;
            const bookingSnap = await bookingRef.get();

            if (!bookingSnap.exists) {
                return { expired: false, reason: "Booking was not found." };
            }

            const booking = bookingType === "bus"
                ? decorateBusBooking(bookingSnap.data())
                : decorateTrainBooking(bookingSnap.data());

            if (input.confirmationCode && booking.confirmationCode && input.confirmationCode !== booking.confirmationCode) {
                return { expired: false, reason: "Confirmation code no longer matches this booking." };
            }

            if (!booking.confirmed || booking.reservationStatus === "expired") {
                return { expired: false, reason: "Booking is not an active confirmed ticket." };
            }

            const expiredBooking = buildExpiredBooking(booking);
            await bookingRef.set(expiredBooking, { merge: true });
            await refs.alertsRef.set({
                status: "ticket_expired",
                incidentType: "ticket_lifecycle",
                title: `${bookingType === "bus" ? "Bus" : "RTS"} ticket expired`,
                message: `The ${bookingType === "bus" ? "bus" : "RTS"} ticket for ${booking.departureTime} is now expired.`,
                updatedAt: expiredBooking.expiredAt,
            }, { merge: true });

            return {
                expired: true,
                bookingType,
                booking: expiredBooking,
            };
        },

        async recordTripReminder(user, input = {}) {
            if (!user?.userId) {
                throw new Error("userId is required.");
            }

            const bookingType = input.bookingType === "bus" ? "bus" : "train";
            const refs = getRefs(user.userId);
            const bookingRef = bookingType === "bus" ? refs.busBookingRef : refs.trainBookingRef;
            const bookingSnap = await bookingRef.get();

            if (!bookingSnap.exists) {
                return { recorded: false, reason: "Booking was not found." };
            }

            const booking = bookingType === "bus"
                ? decorateBusBooking(bookingSnap.data())
                : decorateTrainBooking(bookingSnap.data());

            if (input.confirmationCode && booking.confirmationCode && input.confirmationCode !== booking.confirmationCode) {
                return { recorded: false, reason: "Confirmation code no longer matches this booking." };
            }

            if (!booking.confirmed || booking.reservationStatus === "expired") {
                return { recorded: false, reason: "Booking is not active." };
            }

            const alert = buildReminderAlert({ bookingType, booking });
            await refs.alertsRef.set(alert, { merge: true });

            return {
                recorded: true,
                bookingType,
                alert,
            };
        },

        async getState(user) {
            return clone(await loadState(user));
        },

        async getSnapshot(user) {
            return clone(buildSnapshot(await loadState(user)));
        },

        async resetState(user) {
            const state = normalizeState(createSeedState());
            await saveState(user, state);
            return clone(state);
        },

        async updateTrainBooking(user, input) {
            return persistTrainBookingState(user, (state) => {
                const { origin, destination, departureTime, paymentMethod } = input;

                ensureOption(state.locationOptions, origin, "origin");
                ensureOption(state.locationOptions, destination, "destination");
                ensureOption(state.trainTimeOptions, departureTime, "departureTime");
                ensureOption(state.trainPaymentOptions, paymentMethod, "paymentMethod");

                if (origin) {
                    state.booking.origin = origin;
                    state.busBooking.origin = origin;
                }

                if (destination) {
                    state.booking.destination = destination;
                    state.busBooking.destination = destination;
                    state.booking.fare = buildTrainFare(destination);
                    state.routeGate = buildRouteGate(destination);
                }

                if (departureTime) {
                    state.booking.departureTime = departureTime;
                    syncDerivedTimes(state);
                }

                if (paymentMethod) {
                    state.booking.paymentMethod = paymentMethod;

                    if (state.booking.confirmed) {
                        state.booking.paymentStatus = buildMockPaymentStatus(paymentMethod);
                    }
                }

                state.booking.status = state.booking.confirmed ? "RTS Confirmed" : "RTS Selection Updated";
                state.booking.reservationStatus = state.booking.confirmed ? "confirmed" : "draft";
                state.booking.passStatus = state.passReady ? "ready" : "not_ready";
                state.booking.updatedAt = currentTimestamp();
                updateRouteWindow(state);
                return clone(decorateTrainBooking(state.booking));
            });
        },

        async updateBusBooking(user, input) {
            return persistBusBookingState(user, (state) => {
                const { origin, destination, departureTime, paymentMethod } = input;

                ensureOption(state.locationOptions, origin, "origin");
                ensureOption(state.locationOptions, destination, "destination");
                ensureOption(state.busTimeOptions, departureTime, "departureTime");
                ensureOption(state.busPaymentOptions, paymentMethod, "paymentMethod");

                if (origin) {
                    state.busBooking.origin = origin;
                }

                if (destination) {
                    state.busBooking.destination = destination;
                    state.booking.destination = destination;
                    state.busBooking.fare = buildBusFare(destination);
                    state.routeGate = buildRouteGate(destination);
                }

                if (departureTime) {
                    state.busBooking.departureTime = departureTime;
                    syncDerivedTimes(state);
                }

                if (paymentMethod) {
                    state.busBooking.paymentMethod = paymentMethod;

                    if (state.busBooking.confirmed) {
                        state.busBooking.paymentStatus = buildMockPaymentStatus(paymentMethod);
                    }
                }

                state.busBooking.status = state.busBooking.confirmed ? "Bus Confirmed" : "Bus Selection Updated";
                state.busBooking.reservationStatus = state.busBooking.confirmed ? "confirmed" : "draft";
                state.busBooking.passStatus = state.passReady ? "ready" : "not_ready";
                state.busBooking.updatedAt = currentTimestamp();
                updateRouteWindow(state);
                return clone(decorateBusBooking(state.busBooking));
            });
        },

        async getCarpoolBooking(user) {
            const state = await loadState(user);
            return clone(buildCarpoolBookingPayload(state));
        },

        async selectCarpoolDriver(user, driverId) {
            return mutateState(user, (state) => {
                const driver = state.carpoolDrivers.find((item) => item.id === driverId);

                if (!driver) {
                    throw new Error("driverId does not match an available carpool driver.");
                }

                state.selectedCarpoolDriverId = driverId;
                return clone(buildCarpoolBookingPayload(state));
            });
        },

        async updateCarpoolPayment(user, paymentMethod) {
            return mutateState(user, (state) => {
                const driver = state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

                ensureOption(state.carpoolPaymentOptions, paymentMethod, "paymentMethod");
                driver.paymentMethod = paymentMethod;

                if (state.carpoolBooking.confirmed) {
                    state.carpoolBooking.paymentStatus = buildMockQueuedPaymentStatus(paymentMethod);
                }

                return clone(buildCarpoolBookingPayload(state));
            });
        },

        async confirmTrainBooking(user) {
            return persistTrainBookingState(user, (state) => {
                if (!state.booking.confirmed) {
                    state.booking.confirmationCode = buildConfirmationCode("RTS");
                    state.booking.confirmedAt = currentTimestamp();
                }

                state.booking.confirmed = true;
                state.booking.status = "RTS Confirmed";
                state.booking.reservationStatus = "confirmed";
                state.booking.passStatus = "ready";
                state.booking.paymentStatus = buildMockPaymentStatus(state.booking.paymentMethod);
                state.booking.updatedAt = currentTimestamp();
                state.passReady = true;
                state.routeMode = "RTS Link";

                const historyEntry = buildTripHistoryEntry(decorateTrainBooking(state.booking), state);
                state.tripHistory = [historyEntry, ...(state.tripHistory ?? []).filter((entry) => entry.bookingId !== state.booking.id)].slice(0, 5);
                state.profileDetails = buildProfileReadModel(
                    state,
                    user,
                    state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                    state.tripHistory,
                );

                state.activeTab = "booking";
                updateRouteWindow(state);
                return clone({
                    booking: decorateTrainBooking(state.booking),
                    tripHistory: state.tripHistory,
                    profileDetails: state.profileDetails,
                });
            });
        },

        async confirmBusBooking(user) {
            return persistBusBookingState(user, (state) => {
                if (!state.busBooking.confirmed) {
                    state.busBooking.confirmationCode = buildConfirmationCode("BUS");
                    state.busBooking.confirmedAt = currentTimestamp();
                }

                state.busBooking.confirmed = true;
                state.busBooking.status = "Bus Confirmed";
                state.busBooking.reservationStatus = "confirmed";
                state.busBooking.passStatus = "ready";
                state.busBooking.paymentStatus = buildMockPaymentStatus(state.busBooking.paymentMethod);
                state.busBooking.updatedAt = currentTimestamp();
                state.routeMode = state.busBooking.route;

                const historyEntry = buildTripHistoryEntry(decorateBusBooking(state.busBooking), state);
                state.tripHistory = [historyEntry, ...(state.tripHistory ?? []).filter((entry) => entry.bookingId !== state.busBooking.id)].slice(0, 5);
                state.profileDetails = buildProfileReadModel(
                    state,
                    user,
                    state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                    state.tripHistory,
                );

                state.activeTab = "bus-booking";
                return clone({
                    booking: decorateBusBooking(state.busBooking),
                    tripHistory: state.tripHistory,
                    profileDetails: state.profileDetails,
                });
            });
        },

        async confirmCarpoolBooking(user) {
            return mutateState(user, (state) => {
                const driver = state.carpoolDrivers.find((item) => item.id === state.selectedCarpoolDriverId) ?? state.carpoolDrivers[0];

                if (!state.carpoolBooking.confirmed || state.carpoolBooking.driverId !== driver.id) {
                    if (driver.reservationStatus !== "Reserved") {
                        driver.seats = decrementSeatsLabel(driver.seats);
                    }

                    state.carpoolBooking.confirmationCode = buildConfirmationCode("CAR");
                }

                driver.reservationStatus = "Reserved";
                state.carpoolBooking.confirmed = true;
                state.carpoolBooking.driverId = driver.id;
                state.carpoolBooking.status = "Carpool Reserved";
                state.carpoolBooking.paymentStatus = buildMockQueuedPaymentStatus(driver.paymentMethod);
                state.carpoolBooking.updatedAt = currentTimestamp();
                state.routeMode = "Taxi Carpool";

                state.activeTab = "carpool-booking";
                return clone(buildCarpoolBookingPayload(state));
            });
        },

        async activateCheckIn(user) {
            return persistExperienceState(user, (state) => {
                if (!state.checkInAccepted) {
                    const transaction = buildCreditTransaction({
                        title: "Priority QR Check-In",
                        detail: "Accepted low-volume border window",
                        amount: 120,
                        icon: "qr_code_2",
                    });

                    state.checkInAccepted = true;
                    state.passReady = true;
                    state.balance += 120;
                    pushCreditActivity(state, transaction);
                    state.creditLedger = [transaction, ...(state.creditLedger ?? [])].slice(0, 10);
                    state.checkInDetails = {
                        ...state.checkInDetails,
                        status: "completed",
                        lastCheckInAt: transaction.recordedAt,
                        recommendedWindow: `${addMinutes(state.booking.departureTime, -12)} - ${addMinutes(state.booking.departureTime, 8)}`,
                    };
                    state.profileDetails = buildProfileReadModel(
                        state,
                        user,
                        state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                        state.tripHistory,
                    );
                }

                state.activeTab = "booking";
                return clone(buildSnapshot(state));
            });
        },

        async acceptAlert(user) {
            return persistExperienceState(user, (state) => {
                if (!state.alertAccepted) {
                    const transaction = buildCreditTransaction({
                        title: "Accepted Smart Slot Shift",
                        detail: "Moved to a lower-congestion departure window",
                        amount: 80,
                        icon: "notifications_active",
                    });

                    state.alertOriginalTime = state.booking.departureTime;
                    state.alertSuggestedTime = addMinutes(state.booking.departureTime, 30);
                    state.booking.departureTime = state.alertSuggestedTime;
                    syncDerivedTimes(state);
                    state.alertAccepted = true;
                    state.checkInAccepted = true;
                    state.passReady = true;
                    state.routeMode = "RTS Link";
                    state.routeGate = "North Bridge RTS Transfer";
                    state.balance += 80;
                    pushCreditActivity(state, transaction);
                    state.creditLedger = [transaction, ...(state.creditLedger ?? [])].slice(0, 10);
                    state.alertDetails = {
                        ...state.alertDetails,
                        status: "accepted",
                        suggestedDepartureTime: state.alertSuggestedTime,
                        acceptedAt: transaction.recordedAt,
                        message: "Your trip has been moved to a calmer departure window to reduce congestion exposure.",
                    };
                    state.profileDetails = buildProfileReadModel(
                        state,
                        user,
                        state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                        state.tripHistory,
                    );
                }

                updateRouteWindow(state);
                state.activeTab = "alerts";

                return clone({
                    accepted: state.alertAccepted,
                    routeMode: state.routeMode,
                    routeGate: state.routeGate,
                    routeWindow: state.routeWindow,
                    balance: state.balance,
                    alertDetails: state.alertDetails,
                });
            });
        },

        async getCredits(user) {
            return clone(buildSnapshot(await loadState(user)).credits);
        },

        async getRewards(user) {
            const state = await loadState(user);

            return clone({
                rewards: state.rewards,
                balance: state.balance,
            });
        },

        async redeemReward(user, rewardId) {
            return persistExperienceState(user, (state) => {
                const reward = state.rewards.find((item) => item.id === rewardId);

                if (!reward) {
                    throw new Error("rewardId does not match an available reward.");
                }

                if (state.balance < reward.cost) {
                    throw new Error("Not enough credits to redeem this reward.");
                }

                const redemption = buildRewardRedemption(reward, state.balance - reward.cost);
                const transaction = buildCreditTransaction({
                    title: `Redeemed ${reward.name}`,
                    detail: "Marketplace redemption completed",
                    amount: -reward.cost,
                    icon: "redeem",
                });

                state.balance -= reward.cost;
                pushCreditActivity(state, transaction);
                state.creditLedger = [transaction, ...(state.creditLedger ?? [])].slice(0, 10);
                state.rewardRedemptions = [redemption, ...(state.rewardRedemptions ?? [])].slice(0, 10);
                state.profileDetails = buildProfileReadModel(
                    state,
                    user,
                    state.profileDetails?.memberSince ?? toReadableDate(currentTimestamp()),
                    state.tripHistory,
                );
                state.activeTab = "credits";

                return clone({
                    balance: state.balance,
                    reward,
                    recentCredits: state.recentCredits,
                    creditLedger: state.creditLedger,
                    rewardRedemptions: state.rewardRedemptions,
                });
            });
        },

        async getTripHistory(user) {
            const state = await loadState(user);
            return clone(state.tripHistory ?? []);
        },

        async getProfile(user) {
            const state = await loadState(user);

            return clone({
                ...buildSnapshot(state).profile,
                details: state.profileDetails,
                tripHistory: state.tripHistory,
            });
        },

        async updateProfile(user, input) {
            return persistExperienceState(user, (state) => {
                const nextProfile = {
                    ...state.profileDetails,
                    displayName: typeof input.displayName === "string" ? input.displayName.trim() || state.profileDetails.displayName : state.profileDetails.displayName,
                    email: typeof input.email === "string" ? input.email.trim() || state.profileDetails.email : state.profileDetails.email,
                    photoURL: typeof input.photoURL === "string" ? input.photoURL.trim() : (state.profileDetails.photoURL ?? null),
                    preferredDestination: typeof input.preferredDestination === "string" ? input.preferredDestination.trim() || state.profileDetails.preferredDestination : state.profileDetails.preferredDestination,
                    primaryMode: typeof input.primaryMode === "string" ? input.primaryMode.trim() || state.profileDetails.primaryMode : state.profileDetails.primaryMode,
                    homeHub: typeof input.homeHub === "string" ? input.homeHub.trim() : (state.profileDetails.homeHub ?? null),
                    bio: typeof input.bio === "string" ? input.bio.trim() : (state.profileDetails.bio ?? null),
                    memberSince: state.profileDetails.memberSince ?? toReadableDate(currentTimestamp()),
                };

                state.profileDetails = nextProfile;

                return clone({
                    details: nextProfile,
                });
            });
        },
    };
};
