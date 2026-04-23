import { renderOptions } from "../helpers.js";
import { selectedCarpoolDriver } from "../../state/selectors.js";

export const renderCarpoolBookingPage = (state) => {
    const driver = selectedCarpoolDriver(state);

    return `
        <section class="hero-card hero-card--carpool">
            <div class="hero-copy">
                <div class="booking-head">
                    <button class="back-chip" data-nav="explore">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <div class="pill">
                        <span class="material-symbols-outlined filled">local_taxi</span>
                        <span>Taxi Carpool</span>
                    </div>
                </div>
                <h1>${driver.departureTime} carpool to ${driver.destination}</h1>
                <p>Choose a driver leaving at a specific time, share with 2 or 3 riders, use the HOV green lane, and still earn commuter credits.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Available drivers</span>
                        <h2>Taxi list</h2>
                    </div>
                    <span class="material-symbols-outlined accent">list_alt</span>
                </div>
                <div class="driver-list">
                    ${state.carpoolDrivers.map((item) => `
                        <button class="driver-card ${item.id === state.selectedCarpoolDriverId ? "driver-card--active" : ""}" data-action="select-driver" data-driver="${item.id}">
                            <div>
                                <h4>${item.name}</h4>
                                <p>${item.car} • ${item.seats}</p>
                            </div>
                            <div class="driver-meta">
                                <strong>${item.departureTime}</strong>
                                <span>${item.destination}</span>
                            </div>
                        </button>
                    `).join("")}
                </div>
            </article>

            <article class="panel panel--carpool-ticket">
                <span class="eyebrow">Selected ride</span>
                <h2>${driver.price}</h2>
                <p>${driver.hovLane} and ${driver.credits} for shared border travel.</p>
                <div class="payment-list">
                    <label class="field-card field-card--payment">
                        <small>Payment method</small>
                        <select data-field="carpool-payment">${renderOptions(state.carpoolPaymentOptions, driver.paymentMethod)}</select>
                    </label>
                    <div class="payment-row">
                        <small>Driver</small>
                        <strong>${driver.name}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Seats left</small>
                        <strong>${driver.seats}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Status</small>
                        <strong>${state.carpoolBooking.paymentStatus}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Reservation</small>
                        <strong>${state.carpoolBooking.confirmationCode ?? driver.reservationStatus}</strong>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="primary-action primary-action--light" data-action="confirm-carpool" ${state.pendingAction ? "disabled" : ""}>
                        <span>${state.carpoolBooking.confirmed && state.carpoolBooking.driverId === driver.id ? "Carpool Reserved" : "Reserve Carpool Seat"}</span>
                        <span class="material-symbols-outlined">${state.carpoolBooking.confirmed && state.carpoolBooking.driverId === driver.id ? "check_circle" : "local_taxi"}</span>
                    </button>
                </div>
                <p class="support-copy">
                    ${state.carpoolBooking.confirmed && state.carpoolBooking.driverId === driver.id ? "This driver reservation is stored in the backend with the latest payment selection." : "Reserve the currently selected driver to save the ride and reduce the visible seat count."}
                </p>
            </article>
        </section>
    `;
};
