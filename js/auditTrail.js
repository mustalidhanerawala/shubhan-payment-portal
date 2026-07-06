import { openDocument } from "./cloudinary.js";

import { openModal } from "./app.js";

import {
    listenCompletedPayments,
    formatDate
} from "./request.js";


let auditFilters = {
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: ""
};

let completedPayments = [];
let filteredAuditPayments = [];
let containerId = "paymentContainer";
let searchBoxId = "paymentSearch";

export function openFilterModal() {

    openModal(

        "Apply Filters",

        `
        <input
            type="date"
            id="modalFromDate"
            value="${auditFilters.fromDate}"><br><br>

        <input
            type="date"
            id="modalToDate"
            value="${auditFilters.toDate}"><br><br>

        <input
            type="number"
            id="modalMinAmount"
            placeholder="Min ₹"
            value="${auditFilters.minAmount}"><br><br>

        <input
            type="number"
            id="modalMaxAmount"
            placeholder="Max ₹"
            value="${auditFilters.maxAmount}">
        `,

        () => {

            auditFilters.fromDate =
                document.getElementById("modalFromDate").value;

            auditFilters.toDate =
                document.getElementById("modalToDate").value;

            auditFilters.minAmount =
                document.getElementById("modalMinAmount").value;

            auditFilters.maxAmount =
                document.getElementById("modalMaxAmount").value;

            filterAuditTrail();

        }

    );

}


export function openExportModal() {

    openModal(

        "Export Audit Trail",

        `
        <input type="date" id="exportFromDate" value="${auditFilters.fromDate}"><br><br>

        <input type="date" id="exportToDate" value="${auditFilters.toDate}"><br><br>

        <input type="number" id="exportMinAmount" placeholder="Min ₹" value="${auditFilters.minAmount}"><br><br>

        <input type="number" id="exportMaxAmount" placeholder="Max ₹" value="${auditFilters.maxAmount}">
        `,

        () => {

            auditFilters.fromDate =
                document.getElementById("exportFromDate").value;

            auditFilters.toDate =
                document.getElementById("exportToDate").value;

            auditFilters.minAmount =
                document.getElementById("exportMinAmount").value;

            auditFilters.maxAmount =
                document.getElementById("exportMaxAmount").value;

            filterAuditTrail();

            exportAuditTrail();

        },

        "Export Excel",
        "Close"

    );

}

export function filterAuditTrail() {

    const keyword = document.getElementById(searchBoxId).value.toLowerCase();

    const fromDate = auditFilters.fromDate;

    const toDate = auditFilters.toDate;

    const minAmount =
        Number(auditFilters.minAmount) || 0;

    const maxAmount =
        Number(auditFilters.maxAmount) || Number.MAX_SAFE_INTEGER;

    const filtered = completedPayments.filter(request => {

        const completedDate = request.completedAt
            ? request.completedAt.toDate().toISOString().split("T")[0]
            : "";
        const amount = Number(request.amount);

        const matchesSearch =

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
                .includes(keyword);

        const matchesAmount =
            amount >= minAmount &&
            amount <= maxAmount;

        let matchesDate = true;

        if (fromDate) {

            matchesDate =
                matchesDate &&
                completedDate >= fromDate;

        }

        if (toDate) {

            matchesDate =
                matchesDate &&
                completedDate <= toDate;

        }

        return (

            matchesSearch &&

            matchesAmount &&

            matchesDate

        );

    });

    filteredAuditPayments = filtered;
    renderCompletedPayments(filtered);

}

function exportAuditTrail() {

    const data = filteredAuditPayments.map(request => ({

        "Completed Date": formatDate(request.completedAt),

        "Requested By": request.requestedBy,

        "Expense Type": request.expenseType,

        "Pay To": request.payTo,

        "Amount": request.amount,

        "Description": request.description,

        "Finance Approved By": request.financeApprovedBy,

        "Completed By": request.completedBy,

        "Completion Note": request.completionNote || "",

    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Audit Trail"

    );

    XLSX.writeFile(

        workbook,

        "AuditTrail.xlsx"

    );

}

function renderCompletedPayments(data) {

    const container = document.getElementById(containerId);

    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>No completed payments</p>";
        return;
    }

    let html = `
<h3>Audit Trail</h3>

<table>

    <thead>

        <tr>

            <th>Completed</th>

            <th>Requested By</th>

            <th>Expense Type</th>

            <th>Pay To</th>

            <th>Amount</th>

            <th>Finance Approved By</th>

            <th>Completed By</th>

            <th>Document</th>

            <th>Completion Note</th>

        </tr>

    </thead>

    <tbody>
`;

    data.forEach(req => {

        html += `
     <tr>

    <td>${formatDate(req.completedAt)}</td>

    <td>${req.requestedBy}</td>

    <td>${req.expenseType}</td>

    <td>${req.payTo}</td>

    <td>₹${Number(req.amount).toLocaleString("en-IN")}</td>

    <td>${req.financeApprovedBy}</td>

    <td>${req.completedBy}</td>
    

    <td>

    ${req.documents?.length
                ? req.documents.map((doc, index) => `
            <button
                class="primary-btn view-payment-document"
                data-url="${doc.url}">

                Document ${index + 1}

            </button>
        `).join("")
                : "-"
            }

</td>
    <td>${req.completionNote || "-"}</td>

</tr>`;
    });

    html += "</tbody></table>";

    container.innerHTML = html;
    // ✅ FIX: auto scroll to completed section

}

export function loadCompletedPayments() {

    listenCompletedPayments((requests) => {


        completedPayments = requests;

        filteredAuditPayments = requests;

        renderCompletedPayments(requests);

    });

}

export function configureAuditTrail(options = {}) {

    containerId =
        options.containerId || "paymentContainer";

    searchBoxId =
        options.searchBoxId || "paymentSearch";

}

export function clearAuditFilters() {

    const searchBox = document.getElementById(searchBoxId);

    if (searchBox) {

        searchBox.value = "";

    }

    auditFilters = {

        fromDate: "",
        toDate: "",
        minAmount: "",
        maxAmount: ""

    };

    filteredAuditPayments = [...completedPayments];

    renderCompletedPayments(completedPayments);

}

export function handleAuditTrailClick(event) {

    const button = event.target.closest(".view-payment-document");

    if (!button) return false;

    openDocument(button.dataset.url);

    return true;

}