export const renderDocumentReadinessPage = (state) => {
    const passportMonthsRemaining = state.profileDetails?.passportMonthsRemaining ?? 7;
    const passportValid = passportMonthsRemaining >= 6;
    const needsSingaporeArrivalCard = state.booking.destination.includes("Singapore") || state.busBooking.destination.includes("Singapore");
    const needsMalaysiaArrivalCard = state.booking.origin.includes("Johor") || state.busBooking.origin.includes("Johor");
    const submissionStatuses = {
        sgac: "idle",
        mdac: "idle",
        ...(state.documentSubmissionStatuses ?? {}),
    };
    const hasConfirmedSubmission = Object.values(submissionStatuses).includes("confirmed");
    const getSubmissionText = (submissionStatus) => submissionStatus === "syncing"
        ? "Syncing with ICA/MDAC Databases..."
        : submissionStatus === "verifying"
            ? "Verifying Biometric Token..."
            : submissionStatus === "confirmed"
                ? "Submission Confirmed."
                : "";
    const getCardStatus = (isRequired, submissionStatus) => {
        if (!isRequired) {
            return {
                icon: "check_circle",
                label: "Not required",
                isMuted: false,
            };
        }

        if (submissionStatus === "confirmed") {
            return {
                icon: "check_circle",
                label: "Submitted",
                isMuted: false,
            };
        }

        if (submissionStatus === "syncing" || submissionStatus === "verifying") {
            return {
                icon: submissionStatus === "syncing" ? "sync" : "fingerprint",
                label: "In progress",
                isMuted: true,
            };
        }

        return {
            icon: "schedule",
            label: "Not Submitted",
            isMuted: true,
        };
    };
    const sgacStatus = getCardStatus(needsSingaporeArrivalCard, submissionStatuses.sgac);
    const mdacStatus = getCardStatus(needsMalaysiaArrivalCard, submissionStatuses.mdac);
    const renderArrivalCardAction = (cardType) => {
        const submissionStatus = submissionStatuses[cardType] ?? "idle";
        const isSyncing = submissionStatus === "syncing";
        const isVerifying = submissionStatus === "verifying";
        const isConfirmed = submissionStatus === "confirmed";
        const submissionText = getSubmissionText(submissionStatus);

        if (isConfirmed) {
            return `
                <div class="mini-stat mini-stat--success">
                    <span class="material-symbols-outlined filled">check_circle</span>
                    <div>
                        <strong>Submission Confirmed.</strong>
                        <p>Biometric token matched and digital arrival card status is ready.</p>
                    </div>
                </div>
            `;
        }

        if (isSyncing || isVerifying) {
            return `
                <div class="mini-stat">
                    <span class="material-symbols-outlined filled">${isSyncing ? "sync" : "fingerprint"}</span>
                    <div>
                        <strong>${submissionText}</strong>
                        <p>Please keep this page open while SwiftFlow checks your travel document token.</p>
                    </div>
                </div>
            `;
        }

        return `
            <button class="secondary-action" data-action="submit-arrival-card" data-card="${cardType}">
                <span>Submit Now</span>
                <span class="material-symbols-outlined">send</span>
            </button>
        `;
    };

    return `
        <section class="hero-card hero-card--booking">
            <div class="hero-copy">
                <div class="booking-head">
                    <button class="back-chip" data-nav="passport-checkin">
                        <span class="material-symbols-outlined">arrow_back</span>
                        <span>Back</span>
                    </button>
                    <div class="pill">
                        <span class="material-symbols-outlined filled">verified_user</span>
                        <span>Document readiness</span>
                    </div>
                </div>
                <h1>Passport and arrival cards</h1>
                <p>Review passport validity, digital arrival card status, and visa requirements before activating your pre-check-in pass.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Passport validity</span>
                        <h2>${passportMonthsRemaining} months remaining - ${passportValid ? "Valid" : "Renew soon"}</h2>
                    </div>
                    <span class="material-symbols-outlined accent">${passportValid ? "verified" : "warning"}</span>
                </div>
                <p>${passportValid ? "Your passport has enough validity for this cross-border trip." : "Many border trips require at least 6 months passport validity. Renew before travel."}</p>
                <div class="progress-bar progress-bar--passport">
                    <span style="width: ${Math.min(100, Math.max(8, (passportMonthsRemaining / 12) * 100))}%"></span>
                </div>
            </article>

            <article class="panel panel--accent-soft">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Visa status</span>
                        <h2>Visa not required for this trip.</h2>
                    </div>
                    <span class="material-symbols-outlined accent">fact_check</span>
                </div>
                <p>This mock profile is treated as visa-exempt for the selected Johor-Singapore journey.</p>
                <div class="payment-row">
                    <small>Trip</small>
                    <strong>${state.booking.origin} to ${state.booking.destination}</strong>
                </div>
            </article>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Digital arrival cards</span>
                    <h2>SGAC / MDAC checklist</h2>
                </div>
                <span class="material-symbols-outlined accent">assignment</span>
            </div>
            <div class="profile-bookings-grid">
                <article class="profile-booking-card profile-booking-card--train">
                    <div class="profile-booking-head">
                        <div>
                            <div class="pill ${sgacStatus.isMuted ? "pill--muted" : ""}">
                                <span class="material-symbols-outlined filled">${sgacStatus.icon}</span>
                                <span>${sgacStatus.label}</span>
                            </div>
                            <h3>SG Arrival Card</h3>
                        </div>
                        <span class="material-symbols-outlined">flag</span>
                    </div>
                    <p>${submissionStatuses.sgac === "confirmed" ? "SG Arrival Card: Submitted" : (needsSingaporeArrivalCard ? "SG Arrival Card: Not Submitted" : "SG Arrival Card is not required for this selected direction.")}</p>
                    ${renderArrivalCardAction("sgac")}
                </article>

                <article class="profile-booking-card profile-booking-card--bus">
                    <div class="profile-booking-head">
                        <div>
                            <div class="pill ${mdacStatus.isMuted ? "pill--muted" : ""}">
                                <span class="material-symbols-outlined filled">${mdacStatus.icon}</span>
                                <span>${mdacStatus.label}</span>
                            </div>
                            <h3>Malaysia Digital Arrival Card</h3>
                        </div>
                        <span class="material-symbols-outlined">assignment_ind</span>
                    </div>
                    <p>${submissionStatuses.mdac === "confirmed" ? "MDAC: Submitted" : (needsMalaysiaArrivalCard ? "MDAC: Not Submitted" : "MDAC is not required for this selected direction.")}</p>
                    ${renderArrivalCardAction("mdac")}
                </article>
            </div>
        </section>

        <section class="panel panel--notice">
            <div>
                <span class="eyebrow">Next step</span>
                <h3>${hasConfirmedSubmission ? "QR bar ready" : "Submit one arrival card"}</h3>
                <p>${hasConfirmedSubmission ? "Your submission is confirmed. You can now open the passport QR bar in Profile." : "Submit SGAC or MDAC to sync databases and verify the biometric token before opening the QR bar."}</p>
            </div>
            <div class="notice-actions">
                ${hasConfirmedSubmission ? `
                    <button class="primary-action" data-action="open-confirmed-precheckin-pass">
                        <span>Open QR Bar</span>
                        <span class="material-symbols-outlined">qr_code_2</span>
                    </button>
                ` : ""}
            </div>
        </section>
    `;
};
