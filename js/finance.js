// ==============================================
// SHUBHAN PAYMENT PORTAL
// finance.js
// PART 1
// Mustafa Dashboard UI
// ==============================================
import { openNewRequestForm } from "./employee.js";
import {

    contentArea,
    setPageTitle,
    getCurrentUser,
    updateStats,
    showToast,
    openModal

} from "./app.js";

import {

    listenFinanceRequests,
    getCounts,
    formatDate

} from "./request.js";

let financeUser = null;

let unsubscribeFinance = null;

let financeRequests = [];

let financeView = "dashboard";

// ==============================================
// LOAD FINANCE DASHBOARD
// ==============================================

export function loadFinanceDashboard() {
    financeView = "dashboard";
    financeUser = getCurrentUser();

    setPageTitle("Dashboard");

    contentArea.innerHTML = `

        <div class="finance-dashboard">

            <div class="dashboard-header">

                <div>

                    <h2>Welcome, ${financeUser.name}</h2>

                    <p>
                        Review and manage payment requests.
                    </p>

                </div>

            </div>

        </div>

    `;

    loadRealtimeRequests(false);

}

export function loadFinancePending() {
    financeView = "pending";

    financeUser = getCurrentUser();

    setPageTitle("Pending Requests");

    buildFinanceDashboard();

    loadRealtimeRequests(true);

}

export function loadFinanceCompleted() {

    financeView = "completed";

    financeUser = getCurrentUser();

    setPageTitle("Completed Requests");

    buildFinanceDashboard();

    loadRealtimeRequests(true);

}


// ==============================================
// DASHBOARD HTML
// ==============================================

function buildFinanceDashboard() {

    contentArea.innerHTML = `

    <div class="finance-dashboard">

        <div class="dashboard-header">

            <div>

                <h2>

                    Welcome,
                    ${financeUser.name}

                </h2>

                <p>

                    Review payment requests submitted by employees.

                </p>

            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;">

                <input
                    id="financeSearch"
                    type="text"
                    placeholder="Search Request...">

                <select id="financeFilter">

                    <option value="All">

                        All Status

                    </option>

                    <option value="Pending Finance">

                        Pending Finance

                    </option>

                    <option value="Pending Payment">

                        Pending Payment

                    </option>

                    <option value="Completed">

                        Completed

                    </option>

                    <option value="Declined">

                        Declined

                    </option>

                </select>

            </div>

        </div>

        <div id="financeTableContainer">

        </div>

    </div>

    `;

    document
        .getElementById("financeSearch")
        .addEventListener("input", filterFinanceTable);

    document
        .getElementById("financeFilter")
        .addEventListener("change", filterFinanceTable);

}



// ==============================================
// REALTIME REQUESTS
// ==============================================

function loadRealtimeRequests(renderTable = true) {

    if (unsubscribeFinance) {

        unsubscribeFinance();

    }

    unsubscribeFinance = listenFinanceRequests(

        function (requests) {

            financeRequests = requests;

            updateDashboardCards();

           if (renderTable) {

    let data = requests;

    if (financeView === "pending") {

        data = requests.filter(request =>
            request.status === "Pending Finance"
        );

    }

    else if (financeView === "completed") {

        data = requests.filter(request =>

            request.status === "Pending Payment" ||

            request.status === "Completed" ||

            request.status === "Declined"

        );

    }

    renderFinanceTable(data);

}
        }

    );

}



// ==============================================
// UPDATE STATISTICS
// ==============================================

function updateDashboardCards() {

    const stats = getCounts(

        financeRequests

    );

    updateStats(

        stats.pending,

        stats.approved,

        stats.completed,

        stats.totalAmount

    );

}



// ==============================================
// RENDER TABLE
// ==============================================

function renderFinanceTable(data) {

    if (data.length === 0) {

        document.getElementById(

            "financeTableContainer"

        ).innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-folder-open"></i>

                <h3>

                    No Requests

                </h3>

            </div>

        `;

        return;

    }

    let html = `

    <table>

        <thead>

            <tr>

                <th>

                    Date

                </th>

                <th>

                    Requested By

                </th>

                <th>

                    Expense

                </th>

                <th>

                    Pay To

                </th>

                <th>

                    Amount

                </th>

                <th>

                    Status

                </th>

                <th>

                    Action

                </th>

            </tr>

        </thead>

        <tbody>

    `;

    data.forEach(

        request => {

            html += `

            <tr>

                <td>

                    ${formatDate(request.createdAt)}

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

                    ₹${Number(request.amount).toLocaleString("en-IN")}

                </td>

                <td>

                    ${getStatusBadge(request.status)}

                </td>

                <td>

                    ${getActionButtons(request)}

                </td>

            </tr>

            `;

        }

    );

    html += `

        </tbody>

    </table>

    `;

    document.getElementById(

        "financeTableContainer"

    ).innerHTML = html;

}



// ==============================================
// STATUS BADGES
// ==============================================

function getStatusBadge(status) {

    switch (status) {

        case "Pending Finance":

            return `<span class="status pending">

                Pending Finance

            </span>`;

        case "Pending Payment":

            return `<span class="status approved">

                Pending Payment

            </span>`;

        case "Completed":

            return `<span class="status completed">

                Completed

            </span>`;

        case "Declined":

            return `<span class="status declined">

                Declined

            </span>`;

        default:

            return status;

    }

}



// ==============================================
// ACTION BUTTONS
// ==============================================

function getActionButtons(request) {

    if (request.status === "Pending Finance") {

        return `

<button
    class="primary-btn details-btn"
    data-id="${request.id}">

    Details

</button>

<button
    class="success-btn approve-btn"
    data-id="${request.id}">

    Approve

</button>

<button
    class="danger-btn decline-btn"
    data-id="${request.id}">

    Decline

</button>

`;

    }

    if (request.status === "Pending Payment") {

        return `

        <button
            class="primary-btn"
            disabled>

            Awaiting Payment

        </button>

        `;

    }

    if (request.status === "Completed") {

        return `

        <button
            class="success-btn"
            disabled>

            Completed

        </button>

        `;

    }

    if (request.status === "Declined") {

        return `

        <button
            class="danger-btn"
            disabled>

            Declined

        </button>

        `;

    }

}



// ==============================================
// FILTERS
// ==============================================

function filterFinanceTable() {

    const search = document
        .getElementById("financeSearch")
        .value
        .toLowerCase();

    const status = document
        .getElementById("financeFilter")
        .value;

    const filtered = financeRequests.filter(

        item => {

            const matchesSearch =

                item.requestedBy
                    .toLowerCase()
                    .includes(search)

                ||

                item.payTo
                    .toLowerCase()
                    .includes(search)

                ||

                item.expenseType
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =

                status === "All"

                ||

                item.status === status;

            return (

                matchesSearch

                &&

                matchesStatus

            );

        }

    );

    renderFinanceTable(filtered);

}

// ==============================================
// FINANCE.JS
// PART 2A
// Approval & Decline Actions
// ==============================================

import {

    approveRequest,
    declineRequest,
    getRequest

} from "./request.js";



// ==============================================
// GLOBAL CLICK EVENTS
// ==============================================

document.addEventListener(

    "click",

    async function (e) {

        // -----------------------
        // APPROVE
        // -----------------------

        const approveBtn = e.target.closest(

            ".approve-btn"

        );

        if (approveBtn) {

            const id = approveBtn.dataset.id;

            await approveFinanceRequest(id);

            return;

        }



        // -----------------------
        // DECLINE
        // -----------------------

        const declineBtn = e.target.closest(

            ".decline-btn"

        );

        if (declineBtn) {

            const id = declineBtn.dataset.id;

            await declineFinanceRequest(id);

            return;

        }



        // -----------------------
        // VIEW DETAILS
        // (Implemented in Part 2B)
        // -----------------------

        const detailsBtn = e.target.closest(

            ".details-btn"

        );

        if (detailsBtn) {

            const id = detailsBtn.dataset.id;

            openFinanceDetails(id);

            return;

        }

        // ✅ ADD THIS (DOCUMENT VIEW)
        const documentBtn = e.target.closest(".finance-view-document");

        if (documentBtn) {
            window.open(documentBtn.dataset.url, "_blank");
            return;
        }

    }

);



// ==============================================
// APPROVE
// ==============================================

async function approveFinanceRequest(requestId) {

    openModal(

        "Approve Request",

        "Are you sure you want to approve this payment request?",

        async () => {

            try {

                const success = await approveRequest(

                    requestId,

                    financeUser.name

                );

                if (success) {

                    showToast("Request Approved");

                }

                else {

                    showToast("Unable to approve request");

                }

            }

            catch (error) {

                console.error(error);

                showToast("Approval Failed");

            }

        }

    );

}


// ==============================================
// DECLINE
// ==============================================

async function declineFinanceRequest(requestId) {

    openModal(

        "Decline Request",

        "Are you sure you want to decline this payment request?",

        async () => {

            try {

                const success = await declineRequest(

                    requestId,

                    financeUser.name

                );

                if (success) {

                    showToast("Request Declined");

                }

                else {

                    showToast("Unable to decline request");

                }

            }

            catch (error) {

                console.error(error);

                showToast("Decline Failed");

            }

        }

    );

}


// ==============================================
// PLACEHOLDER
// WILL BE COMPLETED
// IN PART 2B
// ==============================================

async function openFinanceDetails(id) {

    const request = await getRequest(id);

    if (!request) {
        showToast("Request not found");
        return;
    }

    const documentsHTML = request.documents?.length
        ? `
            <hr style="margin:20px 0;">

            <h4>Supporting Documents</h4>

            ${request.documents.map((doc, index) => `
                <button
                    class="primary-btn finance-view-document"
                    data-url="${doc.url}"
                    style="margin:6px;">

                    <i class="fa-solid fa-file"></i>

                    Document ${index + 1}

                </button>
            `).join("")}
        `
        : request.documentUrl
            ? `
                <button
                    class="primary-btn finance-view-document"
                    data-url="${request.documentUrl}">

                    <i class="fa-solid fa-file"></i>

                    Document

                </button>
            `
            : "<p><i>No document uploaded.</i></p>";

    openModal(
        "Payment Request Details",
        `
        <p><strong>Requested By:</strong> ${request.requestedBy}</p>

        <p><strong>Expense Type:</strong> ${request.expenseType}</p>

        <p><strong>Pay To:</strong> ${request.payTo}</p>

        <p><strong>Amount:</strong> ₹${Number(request.amount).toLocaleString("en-IN")}</p>

        <p><strong>Description:</strong> ${request.description}</p>

        ${documentsHTML}
        `,
        null
    );
}