import { topbarTitle } from "../state/selectors.js";
import { escapeHtml, renderNavItem, renderRequestBanner } from "./helpers.js";

const getProfileInitials = (state) => {
    const source = state.profileDetails?.displayName ?? state.authDisplayName ?? "SwiftFlow User";
    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "SF";
};

export const renderLayout = (state, content) => `
    <div class="page-shell">
        <header class="topbar">
            <button class="brand" data-nav="explore">
                <span class="material-symbols-outlined filled">directions_transit</span>
                <span>${topbarTitle(state)}</span>
            </button>
            <div class="topbar-actions">
                <button class="credit-badge" data-nav="credits" aria-label="Open credits">
                    <span class="material-symbols-outlined filled">eco</span>
                    <span>${state.balance.toLocaleString()}</span>
                </button>
                <button class="icon-button" aria-label="Open notifications" data-nav="notifications">
                    <span class="material-symbols-outlined">notifications</span>
                </button>
                <button class="topbar-profile-button" data-nav="profile" aria-label="Open profile">
                    ${state.profileDetails?.photoURL ? `
                        <img src="${escapeHtml(state.profileDetails.photoURL)}" alt="" />
                    ` : `
                        <span>${getProfileInitials(state)}</span>
                    `}
                </button>
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
