import { addMinutes } from "../../utils/time.js";

export const renderPassportCheckinPage = (state) => {
    const checkinOpen = addMinutes(state.booking.departureTime, -30);
    const aiLaneWindow = `${addMinutes(state.booking.departureTime, -12)} - ${addMinutes(state.booking.departureTime, 8)}`;

    return `
        <section class="hero-card hero-card--booking">
            <div class="hero-copy">
                <div class="booking-head">
                    <button class="back-chip" data-nav="explore">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <div class="pill">
                        <span class="material-symbols-outlined filled">badge</span>
                        <span>Passport pre-check-in</span>
                    </div>
                </div>
                <h1>Check in from ${checkinOpen}</h1>
                <p>Your selected departure time unlocks a smoother border journey when passport details are checked 30 minutes before the trip and matched with AI queue prediction.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Driving readiness</span>
                        <h2>${state.booking.origin} to ${state.booking.destination}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">directions_car</span>
                </div>
                <div class="ticket-grid">
                    <div class="ticket-stat">
                        <small>Selected time</small>
                        <strong>${state.booking.departureTime}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Open check-in</small>
                        <strong>${checkinOpen}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Predicted smooth lane</small>
                        <strong>${aiLaneWindow}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Checkpoint ETA</small>
                        <strong>${state.booking.estimatedBorderArrival}</strong>
                    </div>
                </div>
            </article>

            <article class="panel panel--accent-soft">
                <span class="eyebrow">AI prediction</span>
                <h2>Border queue smoothing</h2>
                <p>SwiftFlow predicts the quietest passport scan window around your selected time and recommends pre-checking 30 minutes before departure so document verification finishes before congestion builds.</p>
                <div class="profile-highlight-list">
                    <div class="mini-stat">
                        <span class="material-symbols-outlined filled">schedule</span>
                        <div>
                            <strong>Best arrival buffer: 12 mins</strong>
                            <p>Recommended passport scan time is just ahead of peak lane pressure.</p>
                        </div>
                    </div>
                    <div class="mini-stat">
                        <span class="material-symbols-outlined filled">verified_user</span>
                        <div>
                            <strong>${state.passReady ? "Documents aligned" : "Ready to pre-check"}</strong>
                            <p>${state.passReady ? "Gate and route are already lined up for scanning." : "Complete check-in now to smooth the checkpoint handoff."}</p>
                        </div>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="primary-action" data-nav="document-readiness">
                        <span>${state.checkInAccepted ? "Review document readiness" : "Start passport pre-check-in"}</span>
                        <span class="material-symbols-outlined">verified_user</span>
                    </button>
                </div>
            </article>
        </section>
    `;
};
