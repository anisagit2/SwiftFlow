export const renderProfilePage = (state) => `
    <section class="hero-card hero-card--profile">
        <div class="profile-row">
            <div class="profile-avatar">HF</div>
            <div>
                <span class="eyebrow">Commuter profile</span>
                <h1>Howy Flow</h1>
                <p>Johor-Singapore regular commuter using AI slot shifting and RTS incentives.</p>
            </div>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <span class="eyebrow">Current commute mode</span>
            <h2>${state.routeMode}</h2>
            <p>${state.passReady ? `Priority QR active for ${state.routeGate} at ${state.routeWindow}.` : "No active QR pass yet. Accept a predicted low-volume window to activate one."}</p>
        </article>

        <article class="panel">
            <span class="eyebrow">Sustainability summary</span>
            <h2>${state.ecoSaved} CO2 saved</h2>
            <p>Credits and incentives are tied directly to choices that remove cars from the border queue.</p>
        </article>
    </section>

    <section class="grid-two">
        <article class="panel qr-panel">
            <span class="eyebrow">Sample QR pass</span>
            <h2>Priority border pass</h2>
            <div class="qr-sample">
                <div class="qr-grid">
                    ${Array.from({ length: 49 }, (_, index) => `<span class="${[0,1,5,7,8,9,14,15,16,19,21,22,24,26,28,30,31,32,33,35,40,41,42,47,48].includes(index) ? "is-dark" : ""}"></span>`).join("")}
                </div>
            </div>
            <div class="pass-meta-list">
                <div class="payment-row">
                    <small>Code</small>
                    <strong>JSIC-RTS-0284</strong>
                </div>
                <div class="payment-row">
                    <small>Window</small>
                    <strong>${state.routeWindow}</strong>
                </div>
            </div>
        </article>

        <article class="panel">
            <span class="eyebrow">Pass details</span>
            <h2>${state.booking.destination}</h2>
            <p>This sample pass shows the priority QR style users would scan after pre check-in and slot confirmation.</p>
            <div class="payment-list">
                <div class="payment-row">
                    <small>Route</small>
                    <strong>${state.routeMode}</strong>
                </div>
                <div class="payment-row">
                    <small>Departure</small>
                    <strong>${state.booking.departureTime}</strong>
                </div>
                <div class="payment-row">
                    <small>Gate</small>
                    <strong>${state.routeGate}</strong>
                </div>
            </div>
        </article>
    </section>
`;
