export const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export const renderOptions = (options, selectedValue) =>
    options
        .map((option) => `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`)
        .join("");

export const renderPlaceField = ({ label, field, value, options = [] }) => `
    <label class="field-card field-card--place">
        <small>${label}</small>
        <input
            data-field="${field}"
            data-place-autocomplete="true"
            list="places-${field}"
            value="${escapeHtml(value)}"
            placeholder="Type an address, station, or landmark"
            autocomplete="off"
        />
        <datalist id="places-${field}">
            ${options.map((option) => `<option value="${escapeHtml(option)}"></option>`).join("")}
        </datalist>
    </label>
`;

export const renderNavItem = (activeTab, id, icon, label) => `
    <button class="nav-item ${activeTab === id ? "nav-item--active" : ""}" data-nav="${id}">
        <span class="material-symbols-outlined ${activeTab === id ? "filled" : ""}">${icon}</span>
        <span>${label}</span>
    </button>
`;

export const renderRequestBanner = (state) => {
    if (state.errorMessage) {
        return `
            <div class="request-banner request-banner--error">
                <span class="material-symbols-outlined filled">error</span>
                <span>${state.errorMessage}</span>
            </div>
        `;
    }

    if (state.noticeMessage) {
        return `
            <div class="request-banner request-banner--success">
                <span class="material-symbols-outlined filled">check_circle</span>
                <span>${state.noticeMessage}</span>
            </div>
        `;
    }

    if (state.isBootstrapping) {
        return `
            <div class="request-banner request-banner--info">
                <span class="material-symbols-outlined filled">sync</span>
                <span>Creating your private guest profile and loading live backend data...</span>
            </div>
        `;
    }

    return "";
};
