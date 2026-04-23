import { selectedCarpoolDriver } from "../../state/selectors.js";

const renderBookingStatus = (label, confirmed) => `
    <div class="pill ${confirmed ? "" : "pill--muted"}">
        <span class="material-symbols-outlined filled">${confirmed ? "check_circle" : "schedule"}</span>
        <span>${label}</span>
    </div>
`;

export const renderProfilePage = (state) => {
    const driver = selectedCarpoolDriver(state);
    const profile = state.profileDetails ?? {};
    const draft = state.profileDraft ?? profile;
    const tripHistory = state.tripHistory ?? [];
    const hasTrainBooking = Boolean(state.booking);
    const hasBusBooking = Boolean(state.busBooking);
    const hasCarpoolReservation = Boolean(state.carpoolBooking?.confirmed);
    const activeTrips = profile.activeTrips ?? [state.booking.confirmed, state.busBooking.confirmed, hasCarpoolReservation].filter(Boolean).length;
    const qrMode = state.profileQrMode ?? "rts";
    const precheckinCode = `PCHK-${state.booking.departureTime.replace(":", "")}-${state.routeGate.replace(/\s+/g, "").slice(0, 4).toUpperCase()}`;
    const nameSource = profile.displayName ?? state.authDisplayName ?? "SwiftFlow User";
    const initials = nameSource
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "SF";

    return `
        <section class="hero-card hero-card--profile">
            <div class="hero-orb hero-orb--green"></div>
            <div class="profile-hero">
                <div class="profile-row">
                    <div class="profile-avatar">${initials}</div>
                    <div>
                        <span class="eyebrow">Commuter profile</span>
                        <h1>${nameSource}</h1>
                        <p>${profile.email ?? "Border commute wallet with live booking details, payment confirmations, and backup travel options in one place."}</p>
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

        <section class="grid-two">
            <article class="panel panel--profile-summary">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Travel pass</span>
                        <h2>${state.passReady ? "Priority pass ready" : "Pass waiting for check-in"}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">badge</span>
                </div>
                <p>${state.passReady ? `Your current border pass is aligned to ${state.routeMode}, ${state.routeGate}, and the ${state.routeWindow} travel window.` : "Accept a low-volume check-in window or confirm your preferred trip to activate the pass and gate instructions."}</p>
                <div class="profile-meta-grid">
                    <div class="payment-row">
                        <small>Gate</small>
                        <strong>${state.routeGate}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Window</small>
                        <strong>${state.routeWindow}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Destination</small>
                        <strong>${profile.preferredDestination ?? state.booking.destination}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Credits balance</small>
                        <strong>${state.balance.toLocaleString()}</strong>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="secondary-action" data-nav="passport-checkin">Open passport pre-check-in</button>
                    <button class="secondary-action" data-action="${state.isEditingProfile ? "cancel-profile-edit" : "edit-profile"}">
                        <span>${state.isEditingProfile ? "Cancel profile edit" : "Edit profile"}</span>
                        <span class="material-symbols-outlined">${state.isEditingProfile ? "close" : "edit"}</span>
                    </button>
                </div>
            </article>

            <article class="panel qr-panel" id="qr-pass-panel">
                <span class="eyebrow">Border pass</span>
                <h2>${qrMode === "precheckin" ? "Passport pre-check-in pass" : "Booked RTS QR"}</h2>
                <p>${qrMode === "precheckin" ? "This view shows the separate pre-check-in pass for smoother passport screening before departure." : "This view shows the QR tied to the booked RTS trip and its live confirmation."}</p>
                <div class="stack-actions">
                    <button class="secondary-action" data-action="show-profile-pass" data-mode="rts">Show RTS QR</button>
                    <button class="secondary-action" data-action="show-profile-pass" data-mode="precheckin">Show pre-check-in pass</button>
                </div>
                ${qrMode === "precheckin" ? `
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
                        <strong>${qrMode === "precheckin" ? precheckinCode : state.booking.confirmationCode ?? "JSIC-RTS-0284"}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Status</small>
                        <strong>${qrMode === "precheckin" ? (state.checkInAccepted ? "Passport pre-check-in ready" : "Pre-check-in pending") : (state.passReady ? "Ready at checkpoint" : "Preview only")}</strong>
                    </div>
                </div>
            </article>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Profile details</span>
                    <h2>One user, one editable profile</h2>
                </div>
                <span class="material-symbols-outlined accent">person_edit</span>
            </div>
            <div class="selector-grid">
                <label class="field-card">
                    <small>Display name</small>
                    <input data-profile-field="displayName" value="${draft.displayName ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
                <label class="field-card">
                    <small>Email</small>
                    <input data-profile-field="email" value="${draft.email ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
                <label class="field-card">
                    <small>Preferred destination</small>
                    <input data-profile-field="preferredDestination" value="${draft.preferredDestination ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
                <label class="field-card">
                    <small>Primary mode</small>
                    <input data-profile-field="primaryMode" value="${draft.primaryMode ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
                <label class="field-card">
                    <small>Home hub</small>
                    <input data-profile-field="homeHub" value="${draft.homeHub ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
                <label class="field-card">
                    <small>Bio</small>
                    <input data-profile-field="bio" value="${draft.bio ?? ""}" ${state.isEditingProfile ? "" : "disabled"} />
                </label>
            </div>
            <div class="stack-actions">
                <button class="primary-action" data-action="save-profile" ${state.isEditingProfile ? "" : "disabled"}>
                    <span>${profile.memberSince ? "Save profile changes" : "Create profile"}</span>
                    <span class="material-symbols-outlined">save</span>
                </button>
            </div>
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
                    <h2>Confirmed train journeys</h2>
                </div>
                <span class="material-symbols-outlined accent">history</span>
            </div>
            ${tripHistory.length ? `
                <div class="profile-bookings-grid">
                    ${tripHistory.map((trip) => `
                        <article class="profile-booking-card profile-booking-card--train">
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
                <p>No confirmed train journeys yet. Once you confirm an RTS booking, it will appear here automatically.</p>
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
                <div class="stack-actions">
                    <button class="secondary-action" data-action="reset-state" ${state.pendingAction ? "disabled" : ""}>
                        <span>${state.pendingAction === "reset-state" ? "Resetting demo data..." : "Reset Demo Data"}</span>
                        <span class="material-symbols-outlined">restart_alt</span>
                    </button>
                </div>
            </article>
        </section>
    `;
};
