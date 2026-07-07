// ========================================================
// SHUBHAN PAYMENT PORTAL
// ui-enhancer.js
// Non-intrusive UI enhancements for Corporate Ephemera theme
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
    initSelectObserver();
    initCompletionNoteListener();
});

// 1. OBSERVER FOR DYNAMICALLY INSERTED ELEMENTS (e.g. New Request Form)
function initSelectObserver() {
    const contentArea = document.getElementById("contentArea");
    if (!contentArea) return;

    // Observe changes inside contentArea
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const expenseSelect = document.getElementById("expenseType");
                if (expenseSelect && !expenseSelect.dataset.enhanced) {
                    enhanceExpenseSelect(expenseSelect);
                }
            }
        });
    });

    observer.observe(contentArea, {
        childList: true,
        subtree: true
    });

    // Check if the element already exists on page load
    const expenseSelect = document.getElementById("expenseType");
    if (expenseSelect && !expenseSelect.dataset.enhanced) {
        enhanceExpenseSelect(expenseSelect);
    }
}

// 2. ENHANCE EXPENSE TYPE SELECT DROPDOWN
function enhanceExpenseSelect(selectEl) {
    selectEl.dataset.enhanced = "true";

    // Create wrapper container
    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-wrapper";

    // Set select element styles to hide it accessibly (for form validation to work)
    selectEl.style.position = "absolute";
    selectEl.style.opacity = "0";
    selectEl.style.width = "0";
    selectEl.style.height = "0";
    selectEl.style.padding = "0";
    selectEl.style.margin = "0";
    selectEl.style.border = "none";
    selectEl.style.pointerEvents = "none";

    // Insert wrapper before the select element
    selectEl.parentNode.insertBefore(wrapper, selectEl);
    wrapper.appendChild(selectEl);

    // Get options list
    const options = Array.from(selectEl.options).map(opt => ({
        value: opt.value,
        text: opt.text
    }));

    // Build custom dropdown elements
    const trigger = document.createElement("div");
    trigger.className = "custom-select-trigger";
    trigger.innerHTML = `<span>Select Expense Type</span> <i class="fa-solid fa-chevron-down"></i>`;
    wrapper.appendChild(trigger);

    const dropdownPanel = document.createElement("div");
    dropdownPanel.className = "custom-select-dropdown";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Type to search...";
    searchInput.className = "custom-select-search";
    searchInput.autocomplete = "off";
    dropdownPanel.appendChild(searchInput);

    const optionsList = document.createElement("div");
    optionsList.className = "custom-select-options";
    dropdownPanel.appendChild(optionsList);
    wrapper.appendChild(dropdownPanel);

    // Populate initial options (except the first placeholder if empty)
    function renderOptions(filterText = "") {
        optionsList.innerHTML = "";
        const filtered = options.filter(opt => 
            opt.text.toLowerCase().includes(filterText.toLowerCase())
        );

        if (filtered.length === 0) {
            const noMatch = document.createElement("div");
            noMatch.className = "custom-select-no-match";
            noMatch.innerText = "No matches found";
            optionsList.appendChild(noMatch);
            return;
        }

        filtered.forEach(opt => {
            // Skip empty placeholder option in list
            if (opt.value === "") return;

            const optDiv = document.createElement("div");
            optDiv.className = "custom-select-option";
            if (selectEl.value === opt.value) {
                optDiv.classList.add("selected");
            }
            optDiv.innerText = opt.text;
            optDiv.dataset.value = opt.value;

            optDiv.addEventListener("click", () => {
                selectEl.value = opt.value;
                trigger.querySelector("span").innerText = opt.text;
                trigger.classList.add("has-value");
                
                // Trigger change event so any validations or logic fire
                selectEl.dispatchEvent(new Event("change", { bubbles: true }));
                closeDropdown();
            });

            optionsList.appendChild(optDiv);
        });
    }

    renderOptions();

    // Toggle dropdown
    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains("open");
        closeAllDropdowns();
        if (!isOpen) {
            wrapper.classList.add("open");
            searchInput.focus();
        }
    });

    // Filter options on search
    searchInput.addEventListener("input", (e) => {
        renderOptions(e.target.value);
    });

    searchInput.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent closing dropdown
    });

    // Close on click outside
    function closeDropdown() {
        wrapper.classList.remove("open");
        searchInput.value = "";
        renderOptions();
    }

    // Sync if programmatically changed (e.g. form reset)
    selectEl.addEventListener("change", () => {
        const matchingOpt = options.find(opt => opt.value === selectEl.value);
        if (matchingOpt && selectEl.value !== "") {
            trigger.querySelector("span").innerText = matchingOpt.text;
            trigger.classList.add("has-value");
        } else {
            trigger.querySelector("span").innerText = "Select Expense Type";
            trigger.classList.remove("has-value");
        }
    });
}

function closeAllDropdowns() {
    document.querySelectorAll(".custom-select-wrapper.open").forEach(wrapper => {
        wrapper.classList.remove("open");
        const searchInput = wrapper.querySelector(".custom-select-search");
        if (searchInput) searchInput.value = "";
        // Reset option display list
        const selectEl = wrapper.querySelector("select");
        if (selectEl) {
            const optionsList = wrapper.querySelector(".custom-select-options");
            if (optionsList) {
                // Re-render unfiltered options
                const options = Array.from(selectEl.options).map(opt => ({
                    value: opt.value,
                    text: opt.text
                }));
                optionsList.innerHTML = "";
                options.forEach(opt => {
                    if (opt.value === "") return;
                    const optDiv = document.createElement("div");
                    optDiv.className = "custom-select-option";
                    if (selectEl.value === opt.value) optDiv.classList.add("selected");
                    optDiv.innerText = opt.text;
                    optDiv.dataset.value = opt.value;
                    optDiv.addEventListener("click", () => {
                        selectEl.value = opt.value;
                        wrapper.querySelector(".custom-select-trigger span").innerText = opt.text;
                        wrapper.querySelector(".custom-select-trigger").classList.add("has-value");
                        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
                        wrapper.classList.remove("open");
                        searchInput.value = "";
                    });
                    optionsList.appendChild(optDiv);
                });
            }
        }
    });
}

document.addEventListener("click", () => {
    closeAllDropdowns();
});

// 3. LISTEN TO COMPLETION NOTE CLICKS AND RENDER EXPLAINER POPOVER
function initCompletionNoteListener() {
    document.addEventListener("click", (e) => {
        // Find if clicked cell is a completion note cell
        const cell = e.target.closest("td");
        if (!cell) return;

        const table = cell.closest("table");
        if (!table) return;

        // Check if this cell is in the column corresponding to "Completion Note"
        const cells = Array.from(cell.parentElement.children);
        const index = cells.indexOf(cell);
        const headers = Array.from(table.querySelectorAll("thead th"));
        const header = headers[index];

        if (header && header.textContent.trim().toLowerCase().includes("completion note")) {
            const noteText = cell.textContent.trim();
            if (noteText && noteText !== "-" && noteText !== "") {
                showCompletionNotePopover(cell, noteText);
            }
        }
    });
}

// 4. DISPLAY COMPLETION NOTE IN A CUSTOM RETRO MEMO OVERLAY
function showCompletionNotePopover(cell, text) {
    // Remove existing popovers
    document.querySelectorAll(".completion-note-popover").forEach(p => p.remove());

    const popover = document.createElement("div");
    popover.className = "completion-note-popover";
    popover.innerHTML = `
        <div class="popover-header">
            <span><i class="fa-solid fa-clipboard"></i> TRANSACTION NOTE</span>
            <button class="popover-close"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="popover-body">
            <p>${text}</p>
        </div>
        <div class="popover-footer">
            <span>SHUBHAN VENTURES FAMILY OFFICE</span>
        </div>
    `;

    document.body.appendChild(popover);

    // Position popover near cell
    const rect = cell.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Place it below cell, aligned left
    let top = rect.bottom + scrollY + 8;
    let left = rect.left + scrollX;

    // Check boundary
    if (left + 320 > window.innerWidth) {
        left = window.innerWidth - 340;
    }
    if (top + 200 > document.documentElement.scrollHeight) {
        top = rect.top + scrollY - popover.offsetHeight - 8;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.classList.add("visible");

    // Close events
    const closeBtn = popover.querySelector(".popover-close");
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        popover.remove();
    });

    // Close on clicking outside
    setTimeout(() => {
        const closeOnOutside = (event) => {
            if (!popover.contains(event.target) && event.target !== cell) {
                popover.remove();
                document.removeEventListener("click", closeOnOutside);
            }
        };
        document.addEventListener("click", closeOnOutside);
    }, 10);
}
