export const renderBookingStatus = (label, confirmed) => `
    <div class="pill ${confirmed ? "" : "pill--muted"}">
        <span class="material-symbols-outlined filled">${confirmed ? "check_circle" : "schedule"}</span>
        <span>${label}</span>
    </div>
`;

export const hasConfirmedDocumentSubmission = (state) => Object.values(state.documentSubmissionStatuses ?? {})
    .includes("confirmed");

const getActivePassMode = (state) => {
    const requestedMode = state.profileQrMode ?? "auto";
    const canShowPrecheckin = hasConfirmedDocumentSubmission(state);

    if (requestedMode === "precheckin" && canShowPrecheckin) {
        return "precheckin";
    }

    if (requestedMode === "rts" && state.booking?.confirmed) {
        return "rts";
    }

    if (requestedMode === "bus" && state.busBooking?.confirmed) {
        return "bus";
    }

    if (state.busBooking?.confirmed) {
        return "bus";
    }

    if (state.booking?.confirmed) {
        return "rts";
    }

    return "rts";
};

export const buildPassDetails = (state, precheckinCode) => {
    const mode = getActivePassMode(state);

    if (mode === "precheckin") {
        return {
            mode,
            eyebrow: "Passport pass",
            title: "Passport pre-check-in pass",
            copy: "This view shows the separate pre-check-in pass for smoother passport screening before departure.",
            icon: "badge",
            code: precheckinCode,
            status: state.checkInAccepted ? "Passport pre-check-in ready" : "Pre-check-in pending",
            gate: state.routeGate,
            window: state.routeWindow,
            destination: state.booking.destination,
            label: "Passport",
        };
    }

    if (mode === "bus") {
        return {
            mode,
            eyebrow: "Bus pass",
            title: "Confirmed bus pass",
            copy: "This pass is tied to the confirmed fallback bus booking, route, and mock payment reference.",
            icon: "directions_bus",
            code: state.busBooking.confirmationCode ?? "BUS-PENDING",
            status: state.busBooking.confirmed ? state.busBooking.status : "Bus preview only",
            gate: state.busBooking.route,
            window: `${state.busBooking.departureTime} - ${state.busBooking.arrivalTime}`,
            destination: state.busBooking.destination,
            label: "Bus",
        };
    }

    return {
        mode,
        eyebrow: "RTS pass",
        title: "Booked RTS QR",
        copy: "This view shows the QR tied to the booked RTS trip and its live confirmation.",
        icon: "train",
        code: state.booking.confirmationCode ?? "RTS-PENDING",
        status: state.passReady ? "Ready at checkpoint" : "Preview only",
        gate: state.routeGate,
        window: state.routeWindow,
        destination: state.booking.destination,
        label: "RTS",
    };
};

export const buildProfileViewModel = (state, driver) => {
    const profile = state.profileDetails ?? {};
    const draft = state.profileDraft ?? profile;
    const tripHistory = state.tripHistory ?? [];
    const hasTrainBooking = Boolean(state.booking);
    const hasBusBooking = Boolean(state.busBooking);
    const hasCarpoolReservation = Boolean(state.carpoolBooking?.confirmed);
    const canShowPrecheckinPass = hasConfirmedDocumentSubmission(state);
    const activeTrips = profile.activeTrips ?? [state.booking.confirmed, state.busBooking.confirmed, hasCarpoolReservation].filter(Boolean).length;
    const precheckinCode = `PCHK-${state.booking.departureTime.replace(":", "")}-${state.routeGate.replace(/\s+/g, "").slice(0, 4).toUpperCase()}`;
    const passDetails = buildPassDetails(state, precheckinCode);
    const nameSource = profile.displayName ?? state.authDisplayName ?? "SwiftFlow User";
    const hasProfile = Boolean(profile.memberSince || profile.email);
    const draftName = draft.displayName ?? "";
    const draftEmail = draft.email ?? "";
    const currentHistory = [
        state.booking?.confirmed ? {
            bookingId: state.booking.id,
            type: state.booking.type,
            label: state.booking.status,
            origin: state.booking.origin,
            destination: state.booking.destination,
            departureTime: state.booking.departureTime,
            arrivalTime: state.booking.arrivalTime,
            routeMode: "RTS Link",
            paymentStatus: state.booking.paymentStatus,
            confirmationCode: state.booking.confirmationCode,
            passStatus: state.booking.passStatus,
            recordedAt: state.booking.confirmedAt ?? state.booking.updatedAt,
        } : null,
        state.busBooking?.confirmed ? {
            bookingId: state.busBooking.id,
            type: state.busBooking.type,
            label: state.busBooking.status,
            origin: state.busBooking.origin,
            destination: state.busBooking.destination,
            departureTime: state.busBooking.departureTime,
            arrivalTime: state.busBooking.arrivalTime,
            routeMode: state.busBooking.route,
            paymentStatus: state.busBooking.paymentStatus,
            confirmationCode: state.busBooking.confirmationCode,
            passStatus: state.busBooking.passStatus,
            recordedAt: state.busBooking.confirmedAt ?? state.busBooking.updatedAt,
        } : null,
        state.carpoolBooking?.confirmed ? {
            bookingId: "carpool-active",
            type: "carpool",
            label: state.carpoolBooking.status,
            origin: state.booking.origin,
            destination: driver.destination,
            departureTime: driver.departureTime,
            arrivalTime: driver.departureTime,
            routeMode: "Taxi Carpool",
            paymentStatus: state.carpoolBooking.paymentStatus,
            confirmationCode: state.carpoolBooking.confirmationCode,
            passStatus: "ready",
            recordedAt: state.carpoolBooking.confirmedAt ?? state.carpoolBooking.updatedAt,
        } : null,
    ].filter(Boolean);
    const historyTrips = [
        ...tripHistory,
        ...currentHistory.filter((trip) => !tripHistory.some((item) => item.bookingId === trip.bookingId)),
    ];
    const initials = nameSource
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "SF";

    return {
        profile,
        draft,
        hasTrainBooking,
        hasBusBooking,
        hasCarpoolReservation,
        canShowPrecheckinPass,
        activeTrips,
        precheckinCode,
        passDetails,
        nameSource,
        hasProfile,
        draftName,
        draftEmail,
        historyTrips,
        initials,
    };
};
