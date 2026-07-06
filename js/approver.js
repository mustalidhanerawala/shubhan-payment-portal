// ==============================================
// SHUBHAN PAYMENT PORTAL
// approver.js
// PART 1
// ==============================================
import { openDocument } from "./cloudinary.js";
import { completePayment } from "./request.js";

import {

    contentArea,
    setPageTitle,
    getCurrentUser,
    updateStats,

} from "./app.js";

import {

    listenPendingPayments,
    getCounts,
    formatDate

} from "./request.js";

import {
    configureAuditTrail,
    loadCompletedPayments,
    filterAuditTrail,
    openFilterModal,
    openExportModal,
    clearAuditFilters,
    handleAuditTrailClick
} from "./auditTrail.js";

let approverUser = null;

let pendingPayments = [];

let unsubscribeApprover = null;

let approverView = "dashboard";



// ==============================================
// LOAD DASHBOARD
// ==============================================

export function loadApproverDashboard() {

    approverView = "dashboard";

    approverUser = getCurrentUser();

    setPageTitle("Dashboard");

    contentArea.innerHTML = `

        <div class="finance-dashboard">

            <div class="dashboard-header">

                <div>

                    <h2>

                        Welcome, ${approverUser.name}

                    </h2>

                    <p>

                        Review finance-approved requests and complete payments.

                    </p>

                </div>

            </div>

        </div>

    `;

    loadRealtimePendingPayments(false);

}


// ==============================================
// DASHBOARD
// ==============================================
export function loadPendingPayments() {

    approverView = "pending";

    approverUser = getCurrentUser();

    setPageTitle("Pending Payments");

    renderApproverDashboard();

}
export function loadCompletedPaymentsPage() {

    approverView = "completed";

    approverUser = getCurrentUser();

    setPageTitle("Audit Trail");

    renderApproverDashboard();

}
function renderApproverDashboard() {

    contentArea.innerHTML = `

    <div class="finance-dashboard">

        <div class="dashboard-header">

            <div>

                <h2>

                    Welcome,
                    ${approverUser.name}

                </h2>

                <p>

                    Review finance-approved requests and complete payments.

                </p>

            </div>

         ${approverView === "completed"
            ? `
        <div class="audit-filters">

            <input
                id="paymentSearch"
                type="text"
                placeholder="Search">


            <button id="openFilterModal">
    Apply Filters
</button>

<button id="openExportModal">
    Export to Excel
</button>

<button id="clearFilter">
    Clear
</button>

        </div>
    `
            : `
        <input
            id="paymentSearch"
            type="text"
            placeholder="Search...">
    `
        }

        </div>

        <div id="paymentContainer">

        </div>

    </div>

    `;

    const searchBox = document.getElementById("paymentSearch");

    if (searchBox) {

        searchBox.addEventListener(

            "input",

            approverView === "completed"

                ? filterAuditTrail

                : filterPayments

        );

    }
    if (approverView === "pending") {

        loadRealtimePendingPayments(true);

    }
    else if (approverView === "completed") {

        configureAuditTrail({

            containerId: "paymentContainer",

            searchBoxId: "paymentSearch"

        });

        loadCompletedPayments();

    }

    if (approverView === "completed") {
        document
            .getElementById("openFilterModal")
            .addEventListener("click", openFilterModal);
        document
            .getElementById("clearFilter")
            .addEventListener("click", clearAuditFilters);

        document
            .getElementById("openExportModal")
            .addEventListener("click", openExportModal);


    }
    document
        .getElementById("paymentContainer")
        .addEventListener("click", async (e) => {

            // -------------------------
            // COMPLETE PAYMENT
            // -------------------------
            const completeBtn = e.target.closest(".complete-btn");

            if (completeBtn) {

                const id = completeBtn.dataset.id;

                completeBtn.disabled = true;
                completeBtn.innerText = "Processing...";

                const note = document.querySelector(
                    `.completion-note[data-id="${id}"]`
                ).value.trim();

                const approver = approverUser.name;

                const success = await completePayment(
                    id,
                    approver,
                    note
                );

                if (success) {

                } else {

                    completeBtn.disabled = false;
                    completeBtn.innerText = "Complete";
                }

                return;
            }

            // -------------------------
            // VIEW DOCUMENT
            // -------------------------
            if (handleAuditTrailClick(e)) {
                return;
            }

        });
}








// ==============================================
// REALTIME
// ==============================================

function loadRealtimePendingPayments(renderTable = true) {

    if (unsubscribeApprover) {

        unsubscribeApprover();

    }

    unsubscribeApprover = listenPendingPayments(

        function (requests) {

            pendingPayments = requests;

            updateCards();

            if (renderTable) {

                renderPayments(pendingPayments);

            }

        }

    );

}



// ==============================================
// STATS
// ==============================================

function updateCards() {

    const stats = getCounts(

        pendingPayments

    );

    updateStats(

        stats.pending,

        stats.approved,

        stats.completed,

        stats.totalAmount

    );

}



// ==============================================
// TABLE
// ==============================================

function renderPayments(data) {

    const container = document.getElementById(

        "paymentContainer"

    );

    if (!container) return;

    if (data.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-circle-check"></i>

            <h3>

                No Pending Payments

            </h3>

        </div>

        `;

        return;

    }

    let html = `

    <table>

        <thead>

            <tr>

                <th>Date</th>

                <th>Requested By</th>

                <th>Expense</th>

                <th>Pay To</th>

                <th>Amount</th>

                <th>Action</th>

            </tr>

        </thead>

        <tbody>

    `;

    data.forEach(

        request => {

            html += `

            <tr>

                <td>

                    ${formatDate(

                request.createdAt

            )}

                </td>

                <td>

                    ${request.requestedBy}

                </td>

                <td>

                    ${request.expenseType}

                </td>

                <td>

                    ${request.payTo}

                </td>

                <td>

                    ₹${Number(

                request.amount

            ).toLocaleString("en-IN")}

                </td>

               <td>
<textarea
    class="completion-note"
    data-id="${request.id}"
    placeholder="Add completion note (optional)">
</textarea>
    <button
        class="success-btn complete-btn"
        data-id="${request.id}">

        Complete

    </button>

    ${request.documents?.length ? `
        <div class="request-footer">

        ${request.documents.map((doc, index) => `
            <button
                class="primary-btn view-payment-document"
                data-url="${doc.url}">

                Document ${index + 1}

            </button>
        `).join("")}

        </div>
    ` : ""}

</td>

            </tr>

            `;

        }

    );

    html += `

        </tbody>

    </table>

    `;

    container.innerHTML = html;

}



// ==============================================
// SEARCH
// ==============================================

function filterPayments() {

    const keyword = document

        .getElementById(

            "paymentSearch"

        )

        .value

        .toLowerCase();

    const filtered = pendingPayments.filter(

        request =>

            request.requestedBy

                .toLowerCase()

                .includes(keyword)

            ||

            request.payTo

                .toLowerCase()

                .includes(keyword)

            ||

            request.expenseType

                .toLowerCase()

                .includes(keyword)

    );

    renderPayments(filtered);

}



