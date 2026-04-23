import { selectedCarpoolDriver } from "../../state/selectors.js";

export const renderAlertsPage = (state) => {
    const driver = selectedCarpoolDriver(state);

    return `
        <section class="hero-card hero-card--alert">
            <div class="hero-copy">
                <div class="pill pill--danger">
                    <span class="material-symbols-outlined filled">warning</span>
                    <span>Incident detected</span>
                </div>
                <h1>Slot shifting keeps traffic from peaking.</h1>
                <p>
                    A major accident at the North Bridge crossing and heavy rain risk near Downtown are both increasing road pressure.
                    SwiftFlow can proactively shift your border slot and move you toward RTS Link before congestion spikes.
                </p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel map-panel">
                <div class="map-marker">
                    <span class="material-symbols-outlined filled">car_crash</span>
                </div>
                <div class="map-caption">North Bridge Transit Zone</div>
            </article>

            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Priority window</span>
                        <h2>Schedule Shift</h2>
                    </div>
                    <strong class="trend-up">+30m</strong>
                </div>
                <div class="shift-row">
                    <div>
                        <small>Original</small>
                        <div class="strike">${state.alertOriginalTime}</div>
                    </div>
                    <div class="shift-arrow">
                        <span class="material-symbols-outlined">trending_flat</span>
                    </div>
                    <div class="shift-new">
                        <small>New window</small>
                        <div>${state.booking.departureTime}</div>
                    </div>
                </div>
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">eco</span>
                    <div>
                        <strong>38 mins idling saved</strong>
                        <p>2.4kg CO2 emissions prevented by avoiding gridlock.</p>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="primary-action" data-action="accept-alert">
                        <span>${state.alertAccepted ? `New slot set for ${state.booking.departureTime}` : "Accept New Slot"}</span>
                        <span class="material-symbols-outlined">check_circle</span>
                    </button>
                    <button class="secondary-action" data-action="toggle-alert-routes">
                        ${state.showAlertRoutes ? "Hide alternative routes" : "View alternative routes"}
                    </button>
                </div>
            </article>
        </section>

        ${state.showAlertRoutes ? `
            <section class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Alternative routes</span>
                        <h2>Available ways to cross right now</h2>
                    </div>
                    <span class="material-symbols-outlined accent">alt_route</span>
                </div>
                <div class="route-suggestions-grid">
                    <article class="route-suggestion-card">
                        <div class="route-suggestion-head">
                            <strong>RTS Link</strong>
                            <span>${state.booking.departureTime}</span>
                        </div>
                        <p>Fastest train option with platform access, lower congestion exposure, and QR readiness after confirmation.</p>
                        <button class="secondary-action" data-nav="booking">Open RTS booking</button>
                    </article>
                    <article class="route-suggestion-card">
                        <div class="route-suggestion-head">
                            <strong>${state.busBooking.route}</strong>
                            <span>${state.busBooking.departureTime}</span>
                        </div>
                        <p>Fallback bus to ${state.busBooking.destination} with the same trip context already saved.</p>
                        <button class="secondary-action" data-nav="bus-booking">Open bus booking</button>
                    </article>
                    <article class="route-suggestion-card">
                        <div class="route-suggestion-head">
                            <strong>${driver.name}</strong>
                            <span>${driver.departureTime}</span>
                        </div>
                        <p>Taxi pool via the green lane with pickup from ${driver.pickupSpot}.</p>
                        <button class="secondary-action" data-nav="carpool-booking">Open taxi pool</button>
                    </article>
                </div>
            </section>
        ` : ""}

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Weather traffic intelligence</span>
                        <h2>Heavy rain expected: 2:00 PM</h2>
                    </div>
                    <span class="material-symbols-outlined accent">cloud</span>
                </div>
                <p>Flash floods are predicted in Downtown transit corridors. AI speed forecasts show road traffic could drop from 65 km/h to 15 km/h.</p>
                <div class="forecast-row">
                    <div>
                        <small>Predicted</small>
                        <strong class="danger-text">15 km/h</strong>
                    </div>
                    <div>
                        <small>Current</small>
                        <strong>65 km/h</strong>
                    </div>
                </div>
                <div class="progress-bar">
                    <span style="width:23%"></span>
                </div>
            </article>

            <article class="panel panel--promo">
                <span class="eyebrow">Limited event</span>
                <h2>2x Green Credits</h2>
                <p>Beat the storm. Secure your RTS Link ticket now and double your environmental impact rewards before the gridlock starts.</p>
                <button class="primary-action primary-action--light" data-action="accept-checkin">
                    <span>Secure RTS Slot</span>
                    <span class="material-symbols-outlined">bolt</span>
                </button>
            </article>
        </section>
    `;
};
