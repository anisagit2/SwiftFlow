export const renderAlertsPage = (state) => `
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
                <strong class="trend-up">+45m</strong>
            </div>
            <div class="shift-row">
                <div>
                    <small>Original</small>
                    <div class="strike">09:30</div>
                </div>
                <div class="shift-arrow">
                    <span class="material-symbols-outlined">trending_flat</span>
                </div>
                <div class="shift-new">
                    <small>New window</small>
                    <div>10:15</div>
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
                    <span>${state.alertAccepted ? "Slot shift accepted" : "Accept New Slot"}</span>
                    <span class="material-symbols-outlined">check_circle</span>
                </button>
                <button class="secondary-action" data-action="switch-tab" data-target="explore">View alternative routes</button>
            </div>
        </article>
    </section>

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
