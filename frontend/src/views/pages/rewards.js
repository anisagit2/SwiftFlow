export const renderRewardsPage = (state) => `
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
        <article class="panel panel--feature">
            <span class="eyebrow">Trending</span>
            <h2>VEP Charge Offset</h2>
            <p>Get 50% off your next Vehicle Entry Permit charge when entering the city core.</p>
            <div class="feature-footer">
                <strong>1,200 credits</strong>
                <button class="primary-action" data-action="redeem" data-reward="weekly-pass">Redeem now</button>
            </div>
        </article>

        <article class="panel panel--accent-soft">
            <span class="material-symbols-outlined">eco</span>
            <h3>Eco-Warrior Status</h3>
            <p>Unlock exclusive monthly rewards and priority transit access.</p>
            <strong>5,000 total lifetime credits</strong>
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
            ${state.rewards.map((reward) => `
                <article class="reward-card">
                    <div class="reward-media"></div>
                    <h4>${reward.name}</h4>
                    <p>${reward.description}</p>
                    <div class="reward-footer">
                        <span>${reward.cost} credits</span>
                        <button class="icon-action" data-action="redeem" data-reward="${reward.id}" ${state.balance < reward.cost ? "disabled" : ""}>
                            <span class="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </article>
            `).join("")}
        </div>
    </section>
`;
