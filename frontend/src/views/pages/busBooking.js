import { renderOptions } from "../helpers.js";

export const renderBusBookingPage = (state) => `
    ${state.pendingAction === "confirm-bus" ? `<section class="panel panel--subtle"><p>Saving your fallback bus booking...</p></section>` : ""}
    <section class="hero-card hero-card--bus">
        <div class="hero-copy">
            <div class="booking-head">
                <button class="back-chip" data-nav="explore">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                </button>
                <div class="pill">
                    <span class="material-symbols-outlined filled">directions_bus</span>
                    <span>${state.busBooking.status}</span>
                </div>
            </div>
            <h1>${state.busBooking.departureTime} bus to ${state.busBooking.destination}</h1>
            <p>This bus page mirrors the train detail flow so users can compare destination, timing, and payment before switching.</p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Bus ticket</span>
                    <h2>Departure details</h2>
                </div>
                <span class="material-symbols-outlined accent">directions_bus</span>
            </div>
            <div class="selector-grid">
                <label class="field-card">
                    <small>From</small>
                    <select data-field="bus-origin">${renderOptions(state.locationOptions, state.busBooking.origin)}</select>
                </label>
                <label class="field-card">
                    <small>To</small>
                    <select data-field="destination">${renderOptions(state.locationOptions, state.busBooking.destination)}</select>
                </label>
                <label class="field-card">
                    <small>Bus time</small>
                    <select data-field="bus-time">${renderOptions(state.busTimeOptions, state.busBooking.departureTime)}</select>
                </label>
            </div>
            <div class="ticket-grid">
                <div class="ticket-stat">
                    <small>Origin</small>
                    <strong>${state.busBooking.origin}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Destination</small>
                    <strong>${state.busBooking.destination}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Departure time</small>
                    <strong>${state.busBooking.departureTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Arrival time</small>
                    <strong>${state.busBooking.arrivalTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Route</small>
                    <strong>${state.busBooking.route}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Border ETA</small>
                    <strong>${state.busBooking.estimatedBorderArrival}</strong>
                </div>
            </div>
        </article>

        <article class="panel panel--bus-ticket">
            <span class="eyebrow">Payment</span>
            <h2>${state.busBooking.fare}</h2>
            <p>Choose the mock payment method to display if you switch from RTS to the checkpoint bus. No real payment is processed yet.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="bus-payment">${renderOptions(state.busPaymentOptions, state.busBooking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>${state.busBooking.paymentStatus}</strong>
                </div>
                <div class="payment-row">
                    <small>Confirmation</small>
                    <strong>${state.busBooking.confirmationCode ?? "Not confirmed yet"}</strong>
                </div>
            </div>
            <div class="stack-actions">
                <button class="primary-action primary-action--light" data-action="confirm-bus" ${state.pendingAction ? "disabled" : ""}>
                    <span>${state.busBooking.confirmed ? "Bus Booking Confirmed" : "Confirm Bus Booking"}</span>
                    <span class="material-symbols-outlined">${state.busBooking.confirmed ? "check_circle" : "directions_bus"}</span>
                </button>
                ${state.busBooking.confirmed ? `
                    <button class="secondary-action" data-action="open-pass" data-mode="bus">
                        <span>Show QR Pass</span>
                        <span class="material-symbols-outlined">qr_code_2</span>
                    </button>
                ` : ""}
                <button class="secondary-action" data-nav="booking" ${state.pendingAction ? "disabled" : ""}>
                    <span>Compare with RTS</span>
                    <span class="material-symbols-outlined">compare_arrows</span>
                </button>
            </div>
            <p class="support-copy">
                ${state.busBooking.confirmed ? "Your fallback bus choice is now persisted with a mock payment preview." : "Confirm the bus booking to save the selected route, departure time, and mock payment method."}
            </p>
        </article>
    </section>

    <section class="panel panel--notice">
        <div>
            <span class="eyebrow">Fallback mode</span>
            <h3>Bus remains available</h3>
            <p>The bus option keeps the same destination context as Explore, so users can adjust destination and time without losing the rest of the trip plan.</p>
        </div>
        <div class="notice-actions">
            <button class="secondary-action" data-nav="explore">Return to explore</button>
            <button class="secondary-action" data-nav="alerts">Check alerts</button>
        </div>
    </section>
`;
