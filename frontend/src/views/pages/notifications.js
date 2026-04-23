export const renderNotificationsPage = (state) => `
    <section class="hero-card hero-card--alert">
        <div class="hero-copy">
            <div class="booking-head">
                <button class="back-chip" data-nav="explore">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                </button>
                <div class="pill pill--danger">
                    <span class="material-symbols-outlined filled">notifications_active</span>
                    <span>Predictive alerts</span>
                </div>
            </div>
            <h1>Smart trip notifications</h1>
            <p>SwiftFlow turns traffic, document readiness, green travel, and border proximity into timely actions before the commute gets stressful.</p>
        </div>
    </section>

    <section class="panel">
        <div class="section-head">
            <div>
                <span class="eyebrow">Live notification feed</span>
                <h2>Tap an alert to continue</h2>
            </div>
            <span class="material-symbols-outlined accent">campaign</span>
        </div>

        <div class="route-suggestions-grid">
            <article class="route-suggestion-card">
                <div class="route-suggestion-head">
                    <strong>Time to Leave</strong>
                    <span>Predictive mobility</span>
                </div>
                <p>High congestion detected at Woodlands Checkpoint. Leave now to arrive at your destination by 9:30 AM.</p>
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">traffic</span>
                    <div>
                        <strong>API simulation</strong>
                        <p>Real-time traffic data shows the road route is slowing down.</p>
                    </div>
                </div>
                <button class="primary-action primary-action--light" data-action="open-alert-comparison">
                    <span>View route comparison</span>
                    <span class="material-symbols-outlined">alt_route</span>
                </button>
            </article>

            <article class="route-suggestion-card">
                <div class="route-suggestion-head">
                    <strong>Pre-check Reminder</strong>
                    <span>Efficiency</span>
                </div>
                <p>Your travel to Singapore is in 2 hours. Your SGAC/MDAC arrival card is still missing. Complete it now to avoid delays.</p>
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">schedule</span>
                    <div>
                        <strong>Trip proximity</strong>
                        <p>Triggered by the scheduled trip window and border approach readiness.</p>
                    </div>
                </div>
                <button class="secondary-action" data-nav="document-readiness">
                    <span>Complete SGAC/MDAC now</span>
                    <span class="material-symbols-outlined">assignment</span>
                </button>
            </article>

            <article class="route-suggestion-card">
                <div class="route-suggestion-head">
                    <strong>Carbon Reward</strong>
                    <span>Net zero impact</span>
                </div>
                <p>Eco-Achievement! You saved 4.2kg of CO2 today by taking the shuttle instead of a private car. You've earned 50 SwiftPoints!</p>
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">eco</span>
                    <div>
                        <strong>Green trip detected</strong>
                        <p>Triggered after a completed lower-emission transport mode.</p>
                    </div>
                </div>
                <button class="secondary-action" data-nav="rewards">
                    <span>Open rewards</span>
                    <span class="material-symbols-outlined">redeem</span>
                </button>
            </article>

            <article class="route-suggestion-card">
                <div class="route-suggestion-head">
                    <strong>Smart-Gate Token</strong>
                    <span>Frictionless border</span>
                </div>
                <p>You are 1km from the border. Your Digital Border Pass is ready. Tap to open your QR code.</p>
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">location_on</span>
                    <div>
                        <strong>Geofencing</strong>
                        <p>Triggered by GPS location near the Johor-Singapore Causeway.</p>
                    </div>
                </div>
                <button class="secondary-action" data-action="open-smart-gate-pass">
                    <span>Open QR code</span>
                    <span class="material-symbols-outlined">qr_code_2</span>
                </button>
            </article>
        </div>
    </section>
`;
