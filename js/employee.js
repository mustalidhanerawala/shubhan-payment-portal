// =============================================
// SHUBHAN PAYMENT PORTAL
// EMPLOYEE.JS
// PART 1
// Dashboard UI + Navigation + Request Form
// =============================================
import {
    uploadDocument,
    validateDocument,
    getFileIcon
} from "./cloudinary.js";


import {
    contentArea,
    setPageTitle,
    getCurrentUser,
    showToast,
    updateStats
} from "./app.js";

import {
    createRequest,
    listenEmployeeRequests,
    getCounts,
    formatDate
} from "./request.js";



let currentEmployee = null;
let selectedFiles = [];
let employeeRequests = [];

let unsubscribeEmployee = null;
// =============================================
// MAIN ENTRY
// =============================================

export function loadEmployeeDashboard() {

    currentEmployee = getCurrentUser();

    setPageTitle("Employee Dashboard");

    renderDashboard();
     
    loadEmployeeRequests();

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

                </div>

                <button
                    class="primary-btn"
                    id="newRequestBtn">

                    <i class="fa-solid fa-plus"></i>

                    New Request

                </button>

            </div>


        </div>

    `;

    document
        .getElementById("newRequestBtn")
        .onclick = openNewRequestForm;
}


export function loadEmployeeHistory() {

    currentEmployee = getCurrentUser();

    setPageTitle("My Requests");

    contentArea.innerHTML = `

        <div id="employeeRequestContainer">

            <div class="empty-state">

                Loading...

            </div>

        </div>

    `;

    loadEmployeeRequests();

}
// =============================================
// REQUEST FORM
// =============================================

export function openNewRequestForm() {
    currentEmployee = getCurrentUser();
    selectedFiles = [];
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

                       <option>Personnel</option>

<option>Insurance</option>

<option>Drawdown</option>

<option>Agewell Expenses</option>

<option>Stamp Duty</option>

<option>Petty Cash</option>

<option>Social Media Expense</option>

<option>Advisor Fees</option>

<option>Society Charges</option>

<option>Donation</option>

<option>Entertainment</option>

<option>Annual Maintenance Charges (AMC)</option>

<option>Vendor Payment</option>

<option>Event</option>

<option>Goods and Services Tax (GST)</option>

<option>Professional Tax</option>

<option>Travelling</option>

<option>Administration</option>

<option>Office</option>

<option>Others</option>

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
    multiple
    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx">
    <div id="selectedFilesList" class="selected-files-list"></div>

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
    document
        .getElementById("document")
        .addEventListener("change", handleFileSelection);

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

    const files = selectedFiles;

    if (
        expenseType === "" ||
        payTo === "" ||
        amount <= 0 ||
        description === ""
    ) {

        showToast("Please fill all fields.");

        return;

    }

    for (const file of files) {

        const validation = validateDocument(file);

        if (!validation.valid) {

            showToast(validation.message);

            return;

        }

    }



    const uploadedDocuments = [];

    try {

        if (files.length > 0) {

            document
                .getElementById("uploadProgress")
                .style.display = "block";





            let completedUploads = 0;
            const progressBar = document.getElementById("progressBar");

            for (let i = 0; i < files.length; i++) {

                const upload = await uploadDocument(files[i]);

                uploadedDocuments.push({

                    url: upload.url || "",

                    publicId: upload.publicId || "",

                    originalName: upload.originalName || files[i].name,

                    bytes: upload.bytes ?? files[i].size,

                    format: upload.format || "",

                    resourceType: upload.resourceType || "raw"

                });

                progressBar.value = Math.round(
                    ((i + 1) / files.length) * 100
                );
            }
        }

        const result = await createRequest({

            requestedBy: currentEmployee.name,

            requestedByUsername: currentEmployee.username.toLowerCase(),

            expenseType,

            payTo,

            amount,

            description,

            documents: uploadedDocuments

        });

        if (result.success) {

            selectedFiles = [];

            renderSelectedFiles();

            showToast("Request submitted successfully.");

            loadEmployeeRequests();

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

    const stats = getCounts(employeeRequests);

updateStats(
    stats.pending,
    stats.approved,
    stats.completed,
    stats.totalAmount
);

const container = document.getElementById("employeeRequestContainer");

if (!container) return;
    let html = `


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

                ${request.status === "Completed"
    ? `
<p>

    <strong>Payment Note:</strong>

    ${request.completionNote || "-"}

</p>
`
    : ""
}

            </div>

            <div class="request-footer">

${request.documents?.length

? request.documents.map((doc, index) => `

<button
class="primary-btn view-document"
data-url="${doc.url}">

<i class="fa-solid fa-file"></i>

Document ${index + 1}

</button>

`).join("")

                : request.documentUrl

                    ? `

<button
class="primary-btn view-document"
data-url="${request.documentUrl}">

<i class="fa-solid fa-file"></i>

View Document

</button>

`

                    : ""

            }

</div>

</div>

`;

    });

    html += "</div>";

    container.innerHTML = html;
    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

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

function handleFileSelection(e) {

    const newFiles = Array.from(e.target.files);

    newFiles.forEach(file => {

        const alreadyExists = selectedFiles.some(existing =>

            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified

        );

        if (!alreadyExists) {
            selectedFiles.push(file);
        }

    });

    // Allows selecting the same file again later if removed
    e.target.value = "";

    renderSelectedFiles();

}

function renderSelectedFiles() {

    const container = document.getElementById("selectedFilesList");

    if (!container) return;

    if (selectedFiles.length === 0) {

        container.innerHTML = "";

        return;

    }

    container.innerHTML = selectedFiles.map((file, index) => `

        <div class="selected-file">

            <span>

             <i class="${getFileIcon(file.name)}"></i>

               Document ${index + 1}

                (${Math.round(file.size / 1024)} KB)

            </span>

            <button
                type="button"
                class="remove-file"
                data-index="${index}">

                <i class="fa-solid fa-xmark"></i>

            </button>

        </div>

    `).join("");

}
document.addEventListener("click", function (e) {

    const button = e.target.closest(".remove-file");

    if (!button) return;

    const index = Number(button.dataset.index);

    selectedFiles.splice(index, 1);

    renderSelectedFiles();

});

