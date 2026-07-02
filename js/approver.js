// ==============================================
// SHUBHAN PAYMENT PORTAL
// approver.js
// PART 1
// ==============================================
import { openDocument } from "./cloudinary.js";
import { completePayment } from "./request.js";
import { listenCompletedPayments } from "./request.js";
import {

    contentArea,
    setPageTitle,
    getCurrentUser,
    updateStats

} from "./app.js";

import {

    listenPendingPayments,
    getCounts,
    formatDate

} from "./request.js";

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

    setPageTitle("Completed");

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

            <div>

                <input

                    id="paymentSearch"

                    type="text"

                    placeholder="Search...">

            </div>

        </div>

        <div id="paymentContainer">

        </div>

    </div>

    `;

    document
        .getElementById("paymentSearch")
        .addEventListener(
            "input",
            filterPayments
        );
    if (approverView === "pending") {

        loadRealtimePendingPayments(true);

    }

    else if (approverView === "completed") {

        loadCompletedPayments();

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

                const approver = approverUser.name;

                const success = await completePayment(id, approver);

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
            const documentBtn = e.target.closest(".view-payment-document");

            if (documentBtn) {

                openDocument(documentBtn.dataset.url);

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

let completedPayments = [];
function renderCompletedPayments(data) {

    const container =
        document.getElementById("paymentContainer");

    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>No completed payments</p>";
        return;
    }

    let html = "<h3>Completed Payments</h3><table><tbody>";

    data.forEach(req => {
        html += `
        <tr>
            <td>${req.requestedBy}</td>
            <td>${req.payTo}</td>
            <td>₹${req.amount}</td>
            <td>Completed</td>
        </tr>`;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
    // ✅ FIX: auto scroll to completed section
    container.scrollIntoView({ behavior: "smooth", block: "start" });
}

function loadCompletedPayments() {

    listenCompletedPayments((requests) => {

        console.log("COMPLETED:", requests); // DEBUG (optional but important)

        completedPayments = requests;

        renderCompletedPayments(requests);

    });

}