import { renderOptions } from "../helpers.js";
import { selectedCarpoolDriver } from "../../state/selectors.js";
import { formatCountdown } from "../../utils/time.js";

export const renderExplorePage = (state) => {
    const driver = selectedCarpoolDriver(state);

    return `
        <section class="hero-card hero-card--explore">
            <div class="hero-orb hero-orb--green"></div>
            <div class="hero-copy">
                <div class="pill">
                    <span class="material-symbols-outlined filled">bolt</span>
                    <span>${state.booking.status}</span>
                </div>
                <h1>Your border trip is lined up.</h1>
                <p>
                    SwiftFlow now shows your selected destination, booked RTS departure, estimated border arrival,
                    and backup bus and carpool options so you can move through the Johor-Singapore crossing with less uncertainty.
                </p>
                <div class="hero-actions">
                    <button class="primary-action" data-nav="booking">
                        <span>View RTS Booking</span>
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <button class="secondary-action" data-nav="passport-checkin">
                        <span>Passport pre-check-in</span>
                        <span class="material-symbols-outlined">badge</span>
                    </button>
                    <div class="stat-pill">
                        <span class="material-symbols-outlined">timer</span>
                        <div>
                            <small>Estimated arrival</small>
                            <strong>${state.booking.estimatedBorderArrival}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Selected trip</span>
                        <h2>${state.booking.origin} to ${state.booking.destination}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">route</span>
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
                        <small>RTS time</small>
                        <select data-field="train-time">${renderOptions(state.trainTimeOptions, state.booking.departureTime)}</select>
                    </label>
                </div>
                <div class="trip-summary">
                    <div class="trip-summary__block">
                        <small>From</small>
                        <strong>${state.booking.origin}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>To</small>
                        <strong>${state.booking.destination}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Booked departure</small>
                        <strong>${state.booking.departureTime}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Arrival at RTS</small>
                        <strong>${state.booking.arrivalTime}</strong>
                    </div>
                    <div class="trip-summary__block">
                        <small>Border ETA</small>
                        <strong>${state.booking.estimatedBorderArrival}</strong>
                    </div>
                </div>
                <div class="trip-line">
                    <span>${state.booking.origin}</span>
                    <span class="trip-line__arrow material-symbols-outlined">east</span>
                    <span>${state.booking.destination}</span>
                </div>
            </article>

            <article class="panel panel--accent">
                <span class="material-symbols-outlined">train</span>
                <div>
                    <h3>${state.booking.status}</h3>
                    <p>${state.booking.platform} • Priority boarding ready. Your pre-check-in window stays active for ${formatCountdown(state.countdownSeconds)}.</p>
                </div>
                <div class="impact-chip">
                    <span class="material-symbols-outlined filled">star</span>
                    <span>${state.booking.fare}</span>
                </div>
            </article>
        </section>

        <section class="grid-two">
            <button class="info-card" data-nav="booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">confirmation_number</span>
                </div>
                <div class="info-card__copy">
                    <h4>Booked RTS</h4>
                    <p>${state.booking.departureTime} to ${state.booking.destination} with full ticket and payment details.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <button class="info-card" data-nav="bus-booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">directions_bus</span>
                </div>
                <div class="info-card__copy">
                    <h4>${state.busBooking.status}</h4>
                    <p>${state.busBooking.route} at ${state.busBooking.departureTime} arriving ${state.busBooking.arrivalTime}.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>
        </section>

        <section class="grid-two">
            <button class="info-card" data-nav="carpool-booking">
                <div class="info-card__icon">
                    <span class="material-symbols-outlined">local_taxi</span>
                </div>
                <div class="info-card__copy">
                    <h4>Taxi Carpool</h4>
                    <p>${driver.name} leaves at ${driver.departureTime} with ${driver.seats} and HOV green lane access.</p>
                </div>
                <span class="material-symbols-outlined">chevron_right</span>
            </button>

            <article class="panel panel--carpool-highlight">
                <span class="material-symbols-outlined">groups</span>
                <div>
                    <h3>Shared taxi, faster lane</h3>
                    <p>Carpool taxis can use the HOV green lane, cost slightly more than bus or train, and still reward users with credits.</p>
                </div>
                <div class="impact-chip">
                    <span class="material-symbols-outlined filled">eco</span>
                    <span>${driver.credits}</span>
                </div>
            </article>
        </section>

        <section class="panel panel--notice">
            <div>
                <span class="eyebrow">Travel status</span>
                <h3>${state.booking.departureTime} RTS selected</h3>
                <p>
                    You’ve already selected a destination and confirmed your main train. SwiftFlow keeps bus and taxi carpool visible
                    so you can compare departure time, arrival time, and border reliability without rebooking from scratch.
                </p>
            </div>
            <div class="notice-actions">
                <button class="secondary-action" data-nav="alerts">See incident detail</button>
                <button class="secondary-action" data-nav="booking">Open ticket</button>
                <button class="secondary-action" data-nav="passport-checkin">Passport pre-check-in</button>
            </div>
        </section>
    `;
};
