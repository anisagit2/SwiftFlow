import { topbarTitle } from "../state/selectors.js";
import { renderNavItem, renderRequestBanner } from "./helpers.js";

export const renderLayout = (state, content) => `
    <div class="page-shell">
        <header class="topbar">
            <button class="brand" data-nav="explore">
                <span class="material-symbols-outlined filled">directions_transit</span>
                <span>${topbarTitle(state)}</span>
            </button>
            <div class="topbar-actions">
                <div class="credit-badge">
                    <span class="material-symbols-outlined filled">eco</span>
                    <span>${state.balance.toLocaleString()}</span>
                </div>
                <button class="icon-button" aria-label="Open alerts" data-nav="alerts">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <div class="avatar">HF</div>
            </div>
        </header>

        <main class="page-content">
            ${renderRequestBanner(state)}
            ${content}
        </main>
    </div>

    <nav class="bottom-nav">
        ${renderNavItem(state.activeTab, "explore", "explore", "Explore")}
        ${renderNavItem(state.activeTab, "alerts", "notifications_active", "Alerts")}
        ${renderNavItem(state.activeTab, "credits", "eco", "Credits")}
        ${renderNavItem(state.activeTab, "rewards", "redeem", "Rewards")}
        ${renderNavItem(state.activeTab, "profile", "person", "Profile")}
    </nav>
`;
