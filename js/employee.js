// =============================================
// SHUBHAN PAYMENT PORTAL
// EMPLOYEE.JS
// PART 1
// Dashboard UI + Navigation + Request Form
// =============================================

import {
    contentArea,
    setPageTitle,
    getCurrentUser,
    showToast
} from "./app.js";

import {
    createRequest,
    listenEmployeeRequests,
    getCounts,
    formatDate
} from "./request.js";

import {
    uploadDocument,
    validateDocument
} from "./cloudinary.js";

let currentEmployee = null;
let employeeRequests = [];

let unsubscribeEmployee = null;
// =============================================
// MAIN ENTRY
// =============================================

export function loadEmployeeDashboard() {

    currentEmployee = getCurrentUser();

    setPageTitle("Employee Dashboard");

    renderDashboard();

}

// =============================================
// DASHBOARD
// =============================================

function renderDashboard() {

    contentArea.innerHTML = `

        <div class="employee-dashboard">

            <div class="dashboard-header">

                <div>

                    <h2>
                        Welcome,
                        ${currentEmployee.name}
                    </h2>

                    <p>
                        Create payment requests and monitor their status.
                    </p>

                </div>

                <button
                    class="primary-btn"
                    id="newRequestBtn">

                    <i class="fa-solid fa-plus"></i>

                    New Request

                </button>

            </div>

            <div id="employeeRequestContainer">

                <div class="empty-state">

                    <i class="fa-solid fa-file-circle-xmark"></i>

                    <h3>No Requests Yet</h3>

                    <p>Create your first payment request.</p>

                </div>

            </div>

        </div>

    `;

    document
        .getElementById("newRequestBtn")
        .onclick = openNewRequestForm;
    loadEmployeeRequests();
}

// =============================================
// REQUEST FORM
// =============================================

export function openNewRequestForm() {
      currentEmployee = getCurrentUser();

    console.log(currentEmployee); // temporary

    setPageTitle("New Request");

    contentArea.innerHTML = `

    <div class="request-form-card">

        <h2>Create Payment Request</h2>

        <form id="requestForm">

            <div class="form-grid">

                <div>

                    <label>Requested By</label>

                    <input
                        type="text"
                        value="${currentEmployee.name}"
                        disabled>

                </div>

                <div>

                    <label>Expense Type</label>

                    <select id="expenseType" required>

                        <option value="">

                            Select

                        </option>

                        <option>

                            Vendor Payment

                        </option>

                        <option>

                            Personnel Payment

                        </option>

                        <option>

                            Employee Expense Reimbursement

                        </option>

                        <option>

                            Other

                        </option>

                    </select>

                </div>

            </div>

            <div class="form-grid">

                <div>

                    <label>Pay To</label>

                    <input
                        type="text"
                        id="payTo"
                        required>

                </div>

                <div>

                    <label>Amount</label>

                    <input
                        type="number"
                        id="amount"
                        required>

                </div>

            </div>

            <label>Description</label>

            <textarea
                id="description"
                placeholder="Enter payment details"
                required></textarea>

            <label>

                Upload Supporting Document

            </label>

            <input
                type="file"
                id="document"
                accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls">

            <div
                id="uploadProgress"
                style="margin-top:20px;display:none;">

                <progress
                    id="progressBar"
                    value="0"
                    max="100"
                    style="width:100%;">
                </progress>

            </div>

            <div
                style="margin-top:30px;display:flex;gap:15px;">

                <button
                    class="primary-btn"
                    type="submit">

                    Submit Request

                </button>

                <button
                    type="button"
                    class="danger-btn"
                    id="cancelRequest">

                    Cancel

                </button>

            </div>

        </form>

    </div>

    `;

   document
    .getElementById("cancelRequest")
    .onclick = () => {

        if (currentEmployee.role === "finance") {

            import("./finance.js").then(module => {
                module.loadFinanceDashboard();
            });

        } else {

            renderDashboard();

        }

    };

    document
        .getElementById("requestForm")
        .addEventListener("submit", submitRequest);

}

// =============================================
// SUBMIT REQUEST
// =============================================
async function submitRequest(e) {

    e.preventDefault();

    const expenseType =
        document.getElementById("expenseType").value;

    const payTo =
        document.getElementById("payTo").value.trim();

    const amount =
        Number(document.getElementById("amount").value);

    const description =
        document.getElementById("description").value.trim();

    const file =
        document.getElementById("document").files[0];

    if (
        expenseType === "" ||
        payTo === "" ||
        amount <= 0 ||
        description === ""
    ) {

        showToast("Please fill all fields.");

        return;

    }

    const validation = validateDocument(file);

    if (!validation.valid) {

        showToast(validation.message);

        return;

    }

    let documentUrl = "";

    let publicId = "";

    try {

        if (file) {

            document
                .getElementById("uploadProgress")
                .style.display = "block";

            const upload = await uploadDocument(

                file,

                function (percent) {

                    document
                        .getElementById("progressBar")
                        .value = percent;

                }

            );

            documentUrl = upload.url;

            publicId = upload.publicId;

        }

        const result = await createRequest({

            requestedBy: currentEmployee.name,

            requestedByUsername: currentEmployee.username.toLowerCase(),

            expenseType,

            payTo,

            amount,

            description,

            documentUrl,

            publicId

        });

        if (result.success) {

            showToast("Request submitted successfully.");
            loadEmployeeRequests()
            renderDashboard();

        }

        else {

            showToast("Unable to submit request.");

        }

    }

    catch (error) {

        console.error(error);

        showToast("Upload failed.");

    }

}

/*
    Part 2 will:

    1. Upload document to Cloudinary
    2. Save request in Firestore
    3. Refresh request list

*/



// =============================================
// MENU NAVIGATION
// =============================================



// =============================================
// PUBLIC FUNCTIONS
// =============================================

export {

    renderDashboard,

};

// =============================================
// PART 2
// EMPLOYEE REQUEST LIST
// =============================================


// =============================================
// LOAD REQUESTS
// =============================================

function loadEmployeeRequests() {

    if (unsubscribeEmployee) {

        unsubscribeEmployee();

    }

    unsubscribeEmployee = listenEmployeeRequests(
        currentEmployee.username.toLowerCase(),
        function (requests) {
            employeeRequests = requests;
            renderEmployeeRequests();
        }
    );

}



// =============================================
// RENDER REQUESTS
// =============================================

function renderEmployeeRequests() {

    const container = document.getElementById(

        "employeeRequestContainer"

    );

    if (!container) return;

    if (employeeRequests.length === 0) {

        container.innerHTML = `

        <div class="empty-state">

            <i class="fa-solid fa-folder-open"></i>

            <h3>

                No Requests Yet

            </h3>

            <p>

                Create your first payment request.

            </p>

        </div>

        `;

        return;

    }

    const stats = getCounts(

        employeeRequests

    );

    let html = `

    <div class="stats">

        <div class="stat-card">

            <h2>

                ${stats.pending}

            </h2>

            <p>

                Pending Finance

            </p>

        </div>

        <div class="stat-card">

            <h2>

                ${stats.approved}

            </h2>

            <p>

                Pending Payment

            </p>

        </div>

        <div class="stat-card">

            <h2>

                ${stats.completed}

            </h2>

            <p>

                Completed

            </p>

        </div>

        <div class="stat-card">

            <h2>

                ₹${Number(stats.totalAmount).toLocaleString("en-IN")}

            </h2>

            <p>

                Total Amount

            </p>

        </div>

    </div>

    <div class="request-list">

    `;

    employeeRequests.forEach(function (request) {

        html += `

        <div class="request-card">

            <div class="request-top">

                <div>

                    <h3>

                        ${request.payTo}

                    </h3>

                    <small>

                        ${formatDate(request.createdAt)}

                    </small>

                </div>

                ${statusBadge(request.status)}

            </div>

            <div class="request-body">

                <p>

                    <strong>Expense Type:</strong>

                    ${request.expenseType}

                </p>

                <p>

                    <strong>Amount:</strong>

                    ₹${Number(request.amount).toLocaleString("en-IN")}

                </p>

                <p>

                    <strong>Description:</strong>

                    ${request.description}

                </p>

            </div>

            <div class="request-footer">

                ${request.documentUrl ?

                `

                <button

                    class="primary-btn view-document"

                    data-url="${request.documentUrl}">

                    <i class="fa-solid fa-file"></i>

                    View Document

                </button>

                `

                :

                ""

            }

            </div>

        </div>

        `;

    });

    html += "</div>";

    container.innerHTML = html;
    // ✅ scroll to requests section
    container.scrollIntoView({ behavior: "smooth", block: "start" });

}



// =============================================
// STATUS BADGE
// =============================================

function statusBadge(status) {

    switch (status) {

        case "Pending Finance":

            return `

            <span class="status pending">

                Pending Finance

            </span>

            `;

        case "Pending Payment":

            return `

            <span class="status approved">

                Pending Payment

            </span>

            `;

        case "Completed":

            return `

            <span class="status completed">

                Completed

            </span>

            `;

        case "Declined":

            return `

            <span class="status declined">

                Declined

            </span>

            `;

        default:

            return status;

    }

}



// =============================================
// VIEW DOCUMENT
// =============================================

document.addEventListener(

    "click",

    function (e) {

        const button = e.target.closest(

            ".view-document"

        );

        if (!button) return;

        const url = button.dataset.url;

      window.open(url, "_blank");

    }

);