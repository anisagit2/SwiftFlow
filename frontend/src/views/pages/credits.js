import { creditsProgress } from "../../state/selectors.js";

export const renderCreditsPage = (state) => `
    <section class="hero-card hero-card--credits">
        <div class="hero-orb hero-orb--blue"></div>
        <div class="hero-copy">
            <span class="eyebrow eyebrow--light">Current balance</span>
            <h1>${state.balance.toLocaleString()}</h1>
            <p>Credits are earned when you flatten peak demand, shift to RTS Link or bus, and choose lower-emission border journeys.</p>
            <div class="metric-grid">
                <div class="metric-card">
                    <small>Eco saving</small>
                    <strong>${state.ecoSaved}</strong>
                </div>
                <div class="metric-card">
                    <small>Rank</small>
                    <strong>${state.rank}</strong>
                </div>
            </div>
        </div>
    </section>

    <section class="grid-two">
        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Goal</span>
                    <h2>Urban Pioneer progress</h2>
                </div>
                <span class="material-symbols-outlined accent">trophy</span>
            </div>
            <p>${Math.max(0, state.goalCredits - state.balance)} credits away from premium commuter status.</p>
            <div class="goal-bar">
                <span style="width:${creditsProgress(state)}%"></span>
            </div>
            <div class="goal-foot">
                <span>${state.balance.toLocaleString()} current</span>
                <span>${state.goalCredits.toLocaleString()} target</span>
            </div>
        </article>

        <article class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Reward use</span>
                    <h2>Why credits matter</h2>
                </div>
                <span class="material-symbols-outlined accent">redeem</span>
            </div>
            <p>Credits can be redeemed for local shopping, parking, and transit benefits, creating a direct incentive to leave more cars off the road.</p>
            <button class="secondary-action" data-nav="rewards">Visit marketplace</button>
        </article>
    </section>

    <section class="panel">
        <div class="section-head">
            <div>
                <span class="eyebrow">Recent earnings</span>
                <h2>Credit activity</h2>
            </div>
        </div>
        <div class="earnings-list">
            ${state.recentCredits.map((item) => `
                <article class="earning-card">
                    <div class="earning-icon">
                        <span class="material-symbols-outlined">${item.icon}</span>
                    </div>
                    <div class="earning-copy">
                        <h4>${item.title}</h4>
                        <p>${item.detail}</p>
                        <small>${item.time}</small>
                    </div>
                    <div class="earning-value">+${item.amount}</div>
                </article>
            `).join("")}
        </div>
    </section>
`;
