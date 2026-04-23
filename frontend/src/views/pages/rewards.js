const selectedReward = (state) =>
    state.rewards.find((reward) => reward.id === state.selectedRewardId) ?? state.rewards[0];

export const renderRewardsPage = (state) => {
    const reward = selectedReward(state);
    const recentRedemptions = state.rewardRedemptions ?? [];
    const leaderboard = [
        { rank: 1, name: "GP", points: state.balance, impact: state.ecoSaved },
        { rank: 2, name: "Alya", points: 2140, impact: "3.8kg" },
        { rank: 3, name: "Marcus", points: 1880, impact: "3.1kg" },
    ];

    return `
        <section class="hero-card hero-card--rewards">
            <div class="hero-copy">
                <div class="pill">
                    <span class="material-symbols-outlined filled">redeem</span>
                    <span>Redeem sustainable value</span>
                </div>
                <h1>Turn border-saving behavior into local benefits.</h1>
                <p>Use your green credits for parking, public transit, shopping, and everyday perks that reinforce lower-emission travel.</p>
            </div>
        </section>

        <section class="grid-two">
            <article class="panel panel--accent-soft">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">Sustainability dashboard</span>
                        <h2>${state.ecoSaved} CO2 saved today</h2>
                    </div>
                    <span class="material-symbols-outlined accent">eco</span>
                </div>
                <p>Eco-Achievement logged after choosing a lower-emission shuttle or train route instead of a private car.</p>
                <div class="profile-meta-grid">
                    <div class="payment-row">
                        <small>SwiftPoints earned</small>
                        <strong>+50</strong>
                    </div>
                    <div class="payment-row">
                        <small>Total balance</small>
                        <strong>${state.balance.toLocaleString()}</strong>
                    </div>
                </div>
            </article>

            <article class="panel">
                <div class="section-head">
                    <div>
                        <span class="eyebrow">SwiftFlow leaderboard</span>
                        <h2>Lower-emission commuters</h2>
                    </div>
                    <span class="material-symbols-outlined accent">leaderboard</span>
                </div>
                <div class="payment-list">
                    ${leaderboard.map((item) => `
                        <div class="payment-row">
                            <small>#${item.rank} ${item.name}</small>
                            <strong>${item.points.toLocaleString()} pts / ${item.impact}</strong>
                        </div>
                    `).join("")}
                </div>
            </article>
        </section>

        <section class="grid-two">
            <article class="panel panel--feature">
                <span class="eyebrow">Trending</span>
                <h2>${state.rewards[0].name}</h2>
                <p>${state.rewards[0].description}</p>
                <div class="feature-footer">
                    <strong>${state.rewards[0].cost} credits</strong>
                    <button class="primary-action" data-action="select-reward" data-reward="${state.rewards[0].id}">Redeem now</button>
                </div>
            </article>

            <article class="panel panel--accent-soft rewards-wallet">
                <span class="eyebrow">Credit wallet</span>
                <h3>${state.balance.toLocaleString()} credits available</h3>
                <p>Choose a reward below, review the cost, and decide exactly where your credits should go.</p>
                <div class="payment-list">
                    <div class="payment-row">
                        <small>Selected reward</small>
                        <strong>${reward.name}</strong>
                    </div>
                    <div class="payment-row">
                        <small>Required</small>
                        <strong>${reward.cost} credits</strong>
                    </div>
                    <div class="payment-row">
                        <small>Remaining</small>
                        <strong>${Math.max(0, state.balance - reward.cost).toLocaleString()} credits</strong>
                    </div>
                </div>
                <div class="stack-actions">
                    <button class="primary-action" data-action="redeem" data-reward="${reward.id}" ${state.balance < reward.cost || state.pendingAction ? "disabled" : ""}>
                        <span>${state.balance < reward.cost ? "Not enough credits" : `Use credits on ${reward.name}`}</span>
                        <span class="material-symbols-outlined">redeem</span>
                    </button>
                </div>
            </article>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Marketplace</span>
                    <h2>Transit and lifestyle rewards</h2>
                </div>
            </div>
            <div class="rewards-grid">
                ${state.rewards.map((item) => `
                    <article class="reward-card ${state.selectedRewardId === item.id ? "reward-card--selected" : ""}">
                        <div class="reward-media"></div>
                        <h4>${item.name}</h4>
                        <p>${item.description}</p>
                        <div class="reward-footer">
                            <span>${item.cost} credits</span>
                            <button class="icon-action" data-action="select-reward" data-reward="${item.id}">
                                <span class="material-symbols-outlined">${state.selectedRewardId === item.id ? "check_circle" : "chevron_right"}</span>
                            </button>
                        </div>
                    </article>
                `).join("")}
            </div>
        </section>

        <section class="panel">
            <div class="section-head">
                <div>
                    <span class="eyebrow">Recent redemptions</span>
                    <h2>Reward history</h2>
                </div>
            </div>
            ${recentRedemptions.length ? `
                <div class="earnings-list">
                    ${recentRedemptions.map((item) => `
                        <article class="earning-card">
                            <div class="earning-icon">
                                <span class="material-symbols-outlined">redeem</span>
                            </div>
                            <div class="earning-copy">
                                <h4>${item.rewardName}</h4>
                                <p>${item.status} redemption</p>
                                <small>${item.redeemedAt ? new Date(item.redeemedAt).toLocaleString() : ""}</small>
                            </div>
                            <div class="earning-value">-${item.cost}</div>
                        </article>
                    `).join("")}
                </div>
            ` : "<p>No reward redemptions yet.</p>"}
        </section>
    `;
};
