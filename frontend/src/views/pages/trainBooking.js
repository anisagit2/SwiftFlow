import { renderOptions, renderPlaceField } from "../helpers.js";

export const renderTrainBookingPage = (state) => `
    ${state.pendingAction === "confirm-train" ? `<section class="panel panel--subtle"><p>Confirming your RTS booking...</p></section>` : ""}
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
                ${renderPlaceField({ label: "From", field: "origin", value: state.booking.origin, options: state.locationOptions })}
                ${renderPlaceField({ label: "To", field: "destination", value: state.booking.destination, options: state.locationOptions })}
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
            <p>Choose the mock payment method to display with this train booking. No real payment is processed yet.</p>
            <div class="payment-list">
                <label class="field-card field-card--payment">
                    <small>Payment method</small>
                    <select data-field="train-payment">${renderOptions(state.trainPaymentOptions, state.booking.paymentMethod)}</select>
                </label>
                <div class="payment-row">
                    <small>Status</small>
                    <strong>${state.booking.paymentStatus}</strong>
                </div>
                <div class="payment-row">
                    <small>Confirmation</small>
                    <strong>${state.booking.confirmationCode ?? "Not confirmed yet"}</strong>
                </div>
            </div>
            <div class="stack-actions">
                <button class="primary-action primary-action--light" data-action="confirm-train" ${state.pendingAction ? "disabled" : ""}>
                    <span>${state.booking.confirmed ? "RTS Booking Confirmed" : "Confirm RTS Booking"}</span>
                    <span class="material-symbols-outlined">${state.booking.confirmed ? "check_circle" : "task_alt"}</span>
                </button>
                ${state.booking.confirmed ? `
                    <button class="secondary-action" data-action="open-pass" data-mode="rts">
                        <span>Access QR Pass</span>
                        <span class="material-symbols-outlined">qr_code_2</span>
                    </button>
                ` : ""}
                <button class="secondary-action" data-nav="bus-booking">
                    <span>Compare bus price</span>
                    <span class="material-symbols-outlined">directions_bus</span>
                </button>
            </div>
            <p class="support-copy">
                ${state.booking.confirmed ? "Your RTS booking is saved in the backend with a mock payment preview for reference." : "Confirm the RTS booking to persist the current time, destination, and mock payment method."}
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
