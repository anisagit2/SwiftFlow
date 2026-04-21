import { renderOptions } from "../helpers.js";

export const renderTrainBookingPage = (state) => `
    <section class="hero-card hero-card--booking">
        <div class="hero-copy">
            <div class="booking-head">
                <button class="back-chip" data-nav="explore">
                    <span class="material-symbols-outlined">arrow_back</span>
                    <span>Back</span>
                </button>
                <div class="pill">
                    <span class="material-symbols-outlined filled">train</span>
                    <span>${state.booking.status}</span>
                </div>
            </div>
            <h1>${state.booking.departureTime} RTS to ${state.booking.destination}</h1>
            <p>Your booked train, destination, and payment are all kept in one view so the main explore page can stay focused on trip readiness.</p>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Train ticket</span>
                    <h2>Departure details</h2>
                </div>
                <span class="material-symbols-outlined accent">departure_board</span>
            </div>
            <div class="selector-grid">
                <label class="field-card">
                    <small>From</small>
                    <select data-field="origin">${renderOptions(state.locationOptions, state.booking.origin)}</select>
                </label>
                <label class="field-card">
                    <small>To</small>
                    <select data-field="destination">${renderOptions(state.locationOptions, state.booking.destination)}</select>
                </label>
                <label class="field-card">
                    <small>Departure time</small>
                    <select data-field="train-time">${renderOptions(state.trainTimeOptions, state.booking.departureTime)}</select>
                </label>
            </div>
            <div class="ticket-grid">
                <div class="ticket-stat">
                    <small>Origin</small>
                    <strong>${state.booking.origin}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Destination</small>
                    <strong>${state.booking.destination}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Departure time</small>
                    <strong>${state.booking.departureTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Arrival time</small>
                    <strong>${state.booking.arrivalTime}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Platform</small>
                    <strong>${state.booking.platform}</strong>
                </div>
                <div class="ticket-stat">
                    <small>Border ETA</small>
                    <strong>${state.booking.estimatedBorderArrival}</strong>
                </div>
            </div>
        </article>

        <article class="panel panel--ticket">
            <span class="eyebrow">Payment</span>
            <h2>${state.booking.fare}</h2>
            <p>Choose how the train fare will be charged once the booking is confirmed.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="train-payment">${renderOptions(state.trainPaymentOptions, state.booking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Method</small>
                    <strong>${state.booking.paymentMethod}</strong>
                </div>
                <div class="payment-row">
                    <small>Ticket type</small>
                    <strong>Standard RTS seat</strong>
                </div>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>Ready to charge after booking</strong>
                </div>
            </div>
            <button class="primary-action primary-action--light" data-action="open-pass">
                <span>Open Priority QR Pass</span>
                <span class="material-symbols-outlined">qr_code_2</span>
            </button>
        </article>
    </section>

    <section class="panel panel--notice">
        <div>
            <span class="eyebrow">Comparison</span>
            <h3>RTS booked, bus kept as fallback</h3>
            <p>${state.busBooking.route} still leaves at ${state.busBooking.departureTime} for ${state.busBooking.fare}, but your current RTS booking remains the fastest option.</p>
        </div>
        <div class="notice-actions">
            <button class="secondary-action" data-nav="explore">Return to explore</button>
            <button class="secondary-action" data-nav="alerts">Check alerts</button>
        </div>
    </section>
`;
