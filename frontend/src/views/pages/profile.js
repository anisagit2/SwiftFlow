import { selectedCarpoolDriver } from "../../state/selectors.js";
import { escapeHtml } from "../helpers.js";
import { buildProfileViewModel, renderBookingStatus } from "./profileHelpers.js";

export const renderProfilePage = (state) => {
    const driver = selectedCarpoolDriver(state);
    const {
        profile,
        hasTrainBooking,
        hasBusBooking,
        hasCarpoolReservation,
        canShowPrecheckinPass,
        activeTrips,
        passDetails,
        nameSource,
        hasProfile,
        draftName,
        draftEmail,
        historyTrips,
        initials,
    } = buildProfileViewModel(state, driver);

    return `
        <section class="hero-card hero-card--profile">
            <div class="hero-orb hero-orb--green"></div>
            <div class="profile-hero">
                <div class="profile-row">
                    <div class="profile-avatar-editor">
                        <button
                            class="profile-avatar-button ${profile.photoURL ? "profile-avatar-button--photo" : ""}"
                            id="profile-avatar-trigger"
                            type="button"
                            title="Upload profile picture"
                            aria-label="Upload profile picture"
                            ${state.pendingAction === "upload-avatar" ? "disabled" : ""}
                        >
                            ${profile.photoURL ? `
                                <img src="${escapeHtml(profile.photoURL)}" alt="" />
                            ` : `
                                <span class="profile-avatar-initials">${initials}</span>
                            `}
                            <span class="profile-avatar-edit">
                                <span class="material-symbols-outlined">${state.pendingAction === "upload-avatar" ? "hourglass_top" : "photo_camera"}</span>
                            </span>
                        </button>
                        <input class="visually-hidden" type="file" id="profile-photo-upload" accept="image/png, image/jpeg, image/webp" />
                        <span class="profile-avatar-status">${state.pendingAction === "upload-avatar" ? "Optimizing..." : "Tap to edit"}</span>
                    </div>
                    <div>
                        <span class="eyebrow">Commuter profile</span>
                        <h1>${escapeHtml(nameSource)}</h1>
                        <p>${profile.email ? escapeHtml(profile.email) : "Create a simple commuter profile, then keep your confirmed train, bus, and carpool details in one place."}</p>
                    </div>
                </div>

                <div class="metric-grid metric-grid--profile">
                    <div class="metric-card">
                        <small>Active trips</small>
                        <strong>${activeTrips}</strong>
                    </div>
                    <div class="metric-card">
                        <small>Primary mode</small>
                        <strong>${profile.primaryMode ?? state.routeMode}</strong>
                    </div>
                    <div class="metric-card">
                        <small>Green impact</small>
                        <strong>${state.ecoSaved}</strong>
                    </div>
                </div>
            </div>
        </section>

        <section class="panel panel--profile-editor">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Profile details</span>
                    <h2>${hasProfile ? "Name and email" : "Set up your profile"}</h2>
                </div>
                <button class="icon-action" data-action="${state.isEditingProfile ? "cancel-profile-edit" : "edit-profile"}" aria-label="${state.isEditingProfile ? "Cancel profile edit" : "Edit profile"}">
                    <span class="material-symbols-outlined">${state.isEditingProfile ? "close" : "person_edit"}</span>
                </button>
            </div>
            ${state.isEditingProfile ? `
                <div class="profile-edit-layout">
                    <label class="field-card">
                        <small>Name</small>
                        <input data-profile-field="displayName" value="${escapeHtml(draftName)}" placeholder="Your name" autocomplete="name" />
                    </label>
                    <label class="field-card">
                        <small>Email</small>
                        <input data-profile-field="email" value="${escapeHtml(draftEmail)}" placeholder="you@example.com" autocomplete="email" inputmode="email" />
                    </label>
                    <button class="primary-action" data-action="save-profile" ${state.pendingAction ? "disabled" : ""}>
                        <span>${state.pendingAction === "save-profile" ? "Saving..." : "Save"}</span>
                        <span class="material-symbols-outlined">save</span>
                    </button>
                </div>
            ` : `
                <div class="profile-read-grid">
                    <div class="payment-row">
                        <small>Name</small>
                        <strong>${escapeHtml(profile.displayName ?? "SwiftFlow User")}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Email</small>
                        <strong>${profile.email ? escapeHtml(profile.email) : "Not added"}</strong>
                    </div>
                </div>
            `}
        </section>

        <section class="grid-two">
            <article class="panel panel--profile-summary">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Travel pass</span>
                        <h2>${passDetails.status}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">${passDetails.icon}</span>
                </div>
                <p>${passDetails.mode === "rts" && !state.booking.confirmed ? "Confirm your preferred trip to activate a travel pass." : `${passDetails.label} pass for ${passDetails.destination}, ${passDetails.window}.`}</p>
                <div class="profile-meta-grid">
                    <div class="payment-row">
                        <small>${passDetails.mode === "carpool" ? "Pickup" : "Gate / route"}</small>
                        <strong>${passDetails.gate}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Window</small>
                        <strong>${passDetails.window}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Destination</small>
                        <strong>${passDetails.destination}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Reference</small>
                        <strong>${passDetails.code}</strong>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="secondary-action" data-nav="passport-checkin">Open passport pre-check-in</button>
                </div>
            </article>

            <article class="panel qr-panel" id="qr-pass-panel">
                <span class="eyebrow">${passDetails.eyebrow}</span>
                <h2>${passDetails.title}</h2>
                <p>${passDetails.copy}</p>
                <div class="stack-actions">
                    ${state.booking.confirmed ? `<button class="secondary-action" data-action="show-profile-pass" data-mode="rts">Show RTS QR</button>` : ""}
                    ${state.busBooking.confirmed ? `<button class="secondary-action" data-action="show-profile-pass" data-mode="bus">Show bus pass</button>` : ""}
                    ${canShowPrecheckinPass ? `<button class="secondary-action" data-action="show-profile-pass" data-mode="precheckin">Show pre-check-in pass</button>` : ""}
                </div>
                ${passDetails.mode === "precheckin" ? `
                    <div class="qr-sample qr-sample--barcode">
                        <div class="passport-barcode" aria-label="Passport pre-check-in barcode">
                            ${Array.from({ length: 36 }, (_, index) => `<span class="${[0,1,4,5,8,12,13,16,17,18,22,25,26,29,32,33,35].includes(index) ? "is-wide" : ""}"></span>`).join("")}
                        </div>
                    </div>
                ` : `
                    <div class="qr-sample">
                        <div class="qr-grid">
                            ${Array.from({ length: 49 }, (_, index) => `<span class="${[0,1,5,7,8,9,14,15,16,19,21,22,24,26,28,30,31,32,33,35,40,41,42,47,48].includes(index) ? "is-dark" : ""}"></span>`).join("")}
                        </div>
                    </div>
                `}
                <div class="pass-meta-list">
                    <div class="payment-row">
                        <small>Code</small>
                        <strong>${passDetails.code}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Status</small>
                        <strong>${passDetails.status}</strong>
                    </div>
                </div>
            </article>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Saved trips</span>
                    <h2>Your current bookings</h2>
                </div>
                <span class="material-symbols-outlined accent">confirmation_number</span>
            </div>

            <div class="profile-bookings-grid">
                ${hasTrainBooking ? `
                    <article class="profile-booking-card profile-booking-card--train">
                        <div class="profile-booking-head">
                            <div>
                                ${renderBookingStatus(state.booking.status, state.booking.confirmed)}
                                <h3>${state.booking.departureTime} RTS to ${state.booking.destination}</h3>
                            </div>
                            <span class="material-symbols-outlined">train</span>
                        </div>
                        <p>Primary border trip with platform guidance and mock payment display.</p>
                        <div class="profile-meta-grid">
                            <div class="payment-row">
                                <small>Origin</small>
                                <strong>${state.booking.origin}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Border ETA</small>
                                <strong>${state.booking.estimatedBorderArrival}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Payment</small>
                                <strong>${state.booking.paymentStatus}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Reference</small>
                                <strong>${state.booking.confirmationCode ?? "Pending"}</strong>
                            </div>
                        </div>
                    </article>
                ` : ""}

                ${hasBusBooking ? `
                    <article class="profile-booking-card profile-booking-card--bus">
                        <div class="profile-booking-head">
                            <div>
                                ${renderBookingStatus(state.busBooking.status, state.busBooking.confirmed)}
                                <h3>${state.busBooking.departureTime} ${state.busBooking.route}</h3>
                            </div>
                            <span class="material-symbols-outlined">directions_bus</span>
                        </div>
                        <p>Fallback ride kept ready so you can switch without re-entering trip details, with mock payment display only.</p>
                        <div class="profile-meta-grid">
                            <div class="payment-row">
                                <small>Destination</small>
                                <strong>${state.busBooking.destination}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Arrival</small>
                                <strong>${state.busBooking.arrivalTime}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Payment</small>
                                <strong>${state.busBooking.paymentStatus}</strong>
                            </div>
                            <div class="payment-row">
                                <small>Reference</small>
                                <strong>${state.busBooking.confirmationCode ?? "Pending"}</strong>
                            </div>
                        </div>
                    </article>
                ` : ""}

                <article class="profile-booking-card profile-booking-card--carpool">
                    <div class="profile-booking-head">
                        <div>
                            ${renderBookingStatus(state.carpoolBooking.status ?? "Driver selected", hasCarpoolReservation)}
                            <h3>${driver.name} at ${driver.departureTime}</h3>
                        </div>
                        <span class="material-symbols-outlined">local_taxi</span>
                    </div>
                    <p>${hasCarpoolReservation ? "Reserved shared ride preview with reduced seat availability and saved mock payment choice." : "Selected backup carpool with mock pickup instructions ready when you want to reserve."}</p>
                    <div class="profile-meta-grid">
                        <div class="payment-row">
                            <small>Pickup</small>
                            <strong>${driver.pickupSpot}</strong>
                        </div>
                        <div class="payment-row">
                            <small>Seats left</small>
                            <strong>${driver.seats}</strong>
                        </div>
                        <div class="payment-row">
                            <small>Payment</small>
                            <strong>${state.carpoolBooking.paymentStatus}</strong>
                        </div>
                        <div class="payment-row">
                            <small>Reference</small>
                            <strong>${state.carpoolBooking.confirmationCode ?? "Pending"}</strong>
                        </div>
                    </div>
                </article>
            </div>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Trip history</span>
                    <h2>Confirmed trips</h2>
                </div>
                <span class="material-symbols-outlined accent">history</span>
            </div>
            ${historyTrips.length ? `
                <div class="profile-bookings-grid">
                    ${historyTrips.map((trip) => `
                        <article class="profile-booking-card ${trip.type === "bus" ? "profile-booking-card--bus" : (trip.type === "carpool" ? "profile-booking-card--carpool" : "profile-booking-card--train")}">
                            <div class="profile-booking-head">
                                <div>
                                    ${renderBookingStatus(trip.label ?? "RTS Confirmed", trip.passStatus === "ready")}
                                    <h3>${trip.departureTime} ${trip.routeMode} to ${trip.destination}</h3>
                                </div>
                                <span class="material-symbols-outlined">history</span>
                            </div>
                            <p>Recorded ${trip.recordedAt ? new Date(trip.recordedAt).toLocaleString() : "recently"} with checkpoint access and payment confirmation.</p>
                            <div class="profile-meta-grid">
                                <div class="payment-row">
                                    <small>Origin</small>
                                    <strong>${trip.origin}</strong>
                                </div>
                                <div class="payment-row">
                                    <small>Arrival</small>
                                    <strong>${trip.arrivalTime}</strong>
                                </div>
                                <div class="payment-row">
                                    <small>Payment</small>
                                    <strong>${trip.paymentStatus}</strong>
                                </div>
                                <div class="payment-row">
                                    <small>Reference</small>
                                    <strong>${trip.confirmationCode ?? "Pending"}</strong>
                                </div>
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : `
                <p>No confirmed trips yet. Once you confirm an RTS or bus booking, it will appear here automatically.</p>
            `}
        </section>

        <section class="grid-two">
            <article class="panel">
                <span class="eyebrow">Commute summary</span>
                <h2>${profile.primaryMode ?? state.routeMode}</h2>
                <p>The profile now acts like a compact travel wallet so the commuter can review the primary ride, backups, and pass details without jumping between tabs.</p>
                <div class="payment-list">
                    <div class="payment-row">
                        <small>Primary departure</small>
                        <strong>${profile.latestDepartureTime ?? state.booking.departureTime}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Backup bus</small>
                        <strong>${state.busBooking.departureTime}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Shared ride</small>
                        <strong>${driver.departureTime}</strong>
                    </div>
                </div>
            </article>

            <article class="panel panel--accent-soft">
                <span class="eyebrow">Why this helps</span>
                <h2>One glance trip control</h2>
                <p>Showing confirmations, payment status, and fallback readiness in profile makes the page useful after booking instead of just being a static identity screen.</p>
                <div class="profile-highlight-list">
                    <div class="mini-stat">
                        <span class="material-symbols-outlined filled">verified</span>
                        <div>
                            <strong>${activeTrips} live booking${activeTrips === 1 ? "" : "s"}</strong>
                            <p>${profile.memberSince ? `Member since ${profile.memberSince}.` : "Saved and restorable after refresh."}</p>
                        </div>
                    </div>
                    <div class="mini-stat">
                        <span class="material-symbols-outlined filled">bolt</span>
                        <div>
                            <strong>${state.passReady ? "Pass enabled" : "Pass inactive"}</strong>
                            <p>${state.passReady ? "Ready for the next scan point." : "Activate with check-in or trip confirmation."}</p>
                        </div>
                    </div>
                </div>
            </article>
        </section>
    `;
};
