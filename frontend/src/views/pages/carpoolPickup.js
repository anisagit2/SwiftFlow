import { selectedCarpoolDriver } from "../../state/selectors.js";

export const renderCarpoolPickupPage = (state) => {
    const driver = selectedCarpoolDriver(state);

    return `
        <section class="hero-card hero-card--carpool">
            <div class="hero-copy">
                <div class="booking-head">
                    <button class="back-chip" data-nav="carpool-booking">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <div class="pill">
                        <span class="material-symbols-outlined filled">place</span>
                        <span>Pickup point</span>
                    </div>
                </div>
                <h1>Go to ${driver.pickupSpot}</h1>
                <p>Your reserved taxi pool now has a dedicated pickup view so the commuter can follow the next step after reserving the seat.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel carpool-map-panel">
                <div class="map-pin">
                    <span class="material-symbols-outlined filled">place</span>
                </div>
                <div class="map-caption">${driver.pickupSpot}</div>
            </article>

            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Pickup route</span>
                        <h2>${driver.name} at ${driver.departureTime}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">map</span>
                </div>
                <div class="ticket-grid">
                    <div class="ticket-stat">
                        <small>From</small>
                        <strong>${state.booking.origin}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>To</small>
                        <strong>${driver.destination}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Pickup spot</small>
                        <strong>${driver.pickupSpot}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Walk ETA</small>
                        <strong>${driver.pickupEta}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Departure time</small>
                        <strong>${driver.departureTime}</strong>
                    </div>
                    <div class="ticket-stat">
                        <small>Lane access</small>
                        <strong>${driver.hovLane}</strong>
                    </div>
                </div>
            </article>
        </section>
    `;
};
