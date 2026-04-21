import { renderOptions } from "../helpers.js";

export const renderBusBookingPage = (state) => `
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
            <p>Choose how the bus fare should be charged if you switch from RTS to the checkpoint bus.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="bus-payment">${renderOptions(state.busPaymentOptions, state.busBooking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Method</small>
                    <strong>${state.busBooking.paymentMethod}</strong>
                </div>
                <div class="payment-row">
                    <small>Ticket type</small>
                    <strong>Checkpoint express bus</strong>
                </div>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>Ready to charge after booking</strong>
                </div>
            </div>
            <button class="primary-action primary-action--light" data-nav="booking">
                <span>Compare with RTS</span>
                <span class="material-symbols-outlined">compare_arrows</span>
            </button>
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
