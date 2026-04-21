export const renderOptions = (options, selectedValue) =>
    options
        .map((option) => `<option value="${option}" ${option === selectedValue ? "selected" : ""}>${option}</option>`)
        .join("");

export const renderNavItem = (activeTab, id, icon, label) => `
    <button class="nav-item ${activeTab === id ? "nav-item--active" : ""}" data-nav="${id}">
        <span class="material-symbols-outlined ${activeTab === id ? "filled" : ""}">${icon}</span>
        <span>${label}</span>
    </button>
`;
