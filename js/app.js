// =====================================
// SHUBHAN PAYMENT PORTAL
// APP.JS
// =====================================
import {
    loadEmployeeDashboard,
    openNewRequestForm,
    loadEmployeeHistory
} from "./employee.js";

import {
    loadFinanceDashboard,
    loadFinancePending,
    loadFinanceCompleted
} from "./finance.js";

import {
    loadApproverDashboard,
    loadPendingPayments,
    loadCompletedPaymentsPage
} from "./approver.js";


// Current Logged In User
let currentUser = null;

// Modal Callback
let modalCallback = null;


// =====================================
// DOM ELEMENTS
// =====================================

const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");

const loader = document.getElementById("loader");
const toast = document.getElementById("toast");

const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");

const sidebar = document.querySelector(".sidebar");

const logoutBtn = document.getElementById("logoutBtn");

const loggedUser = document.getElementById("loggedUser");
const loggedRole = document.getElementById("loggedRole");

const pageTitle = document.getElementById("pageTitle");

const menuList = document.getElementById("menuList");


// Modal

const modalOverlay = document.getElementById("modalOverlay");

const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

const confirmModal = document.getElementById("confirmModal");
const cancelModal = document.getElementById("cancelModal");



// =====================================
// LOADER
// =====================================

export function showLoader() {

    loader.style.display = "flex";

}

export function hideLoader() {

    loader.style.display = "none";

}



// =====================================
// TOAST
// =====================================

export function showToast(message) {

    toast.innerHTML = message;

    toast.style.display = "block";

    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}



// =====================================
// MODAL
// =====================================

export function openModal(title, text, callback) {

    modalTitle.innerHTML = title;

    modalText.innerHTML = text;

    modalOverlay.style.display = "flex";

    modalCallback = callback;

}

cancelModal.onclick = () => {

    modalOverlay.style.display = "none";

};

confirmModal.onclick = () => {

    modalOverlay.style.display = "none";

    if (modalCallback) {

        modalCallback();

    }

};



// =====================================
// SIDEBAR
// =====================================

menuBtn.onclick = () => {

    sidebar.classList.add("show");

};

closeSidebar.onclick = () => {

    sidebar.classList.remove("show");

};



// =====================================
// DASHBOARD
// =====================================

export function showDashboard(user) {

    currentUser = user;

    loginPage.classList.remove("active");

    dashboardPage.classList.add("active");

    loggedUser.innerHTML = user.name;

    loggedRole.innerHTML = user.role;

    buildSidebar(user.role);

    sidebar.classList.remove("show");

    switch (user.role) {

        case "employee":

            loadEmployeeDashboard();

            break;

        case "finance":

            loadFinanceDashboard();

            break;

        case "approver":

            loadApproverDashboard();

            break;

        default:

            showToast("Unknown user role.");

    }

}

export function showLogin() {

    loginPage.classList.add("active");

    dashboardPage.classList.remove("active");

}



// =====================================
// SIDEBAR MENU
// =====================================

function buildSidebar(role) {

    menuList.innerHTML = "";

    if (role === "employee") {

        menuList.innerHTML = `

<li><a href="#" data-page="dashboard"><i class="fa-solid fa-house"></i> Dashboard</a></li>

<li><a href="#" data-page="newRequest"><i class="fa-solid fa-plus"></i> New Request</a></li>

<li><a href="#" data-page="history"><i class="fa-solid fa-clock"></i> My Requests</a></li>

`;

    }

    else if (role === "finance") {

        menuList.innerHTML = `

<li><a href="#" data-page="dashboard"><i class="fa-solid fa-house"></i> Dashboard</a></li>

<li><a href="#" data-page="pending"><i class="fa-solid fa-hourglass-half"></i> Pending</a></li>

<li><a href="#" data-page="completed"><i class="fa-solid fa-circle-check"></i> Completed</a></li>

<li><a href="#" data-page="newRequest"><i class="fa-solid fa-plus"></i> New Request</a></li>

`;

    }

    else if (role === "approver") {

        menuList.innerHTML = `

<li><a href="#" data-page="dashboard"><i class="fa-solid fa-house"></i> Dashboard</a></li>

<li><a href="#" data-page="payments"><i class="fa-solid fa-money-check-dollar"></i> Pending Payments</a></li>

<li><a href="#" data-page="completed"><i class="fa-solid fa-circle-check"></i> Completed</a></li>

`;

    }

}



// =====================================
// TITLE
// =====================================

export function setPageTitle(title) {

    pageTitle.innerHTML = title;

}



// =====================================
// CURRENT USER
// =====================================

export function getCurrentUser() {

    return currentUser;

}



// =====================================
// LOGOUT
// =====================================

logoutBtn.onclick = () => {

    localStorage.removeItem("loggedUser");

    location.reload();

};



// =====================================
// SESSION CHECK
// =====================================

window.addEventListener("load", () => {

    const user = localStorage.getItem("loggedUser");

    if (user) {

        currentUser = JSON.parse(user);

        showDashboard(currentUser);

    }

});



// =====================================
// CONTENT AREA
// =====================================

export const contentArea = document.getElementById("contentArea");



// =====================================
// STAT CARDS
// =====================================

export function updateStats(
    pending,
    approved,
    completed,
    amount
) {

    document.getElementById("pendingCount").innerHTML = pending;

    document.getElementById("approvedCount").innerHTML = approved;

    document.getElementById("completedCount").innerHTML = completed;

    document.getElementById("totalAmount").innerHTML =
        "₹" + Number(amount).toLocaleString("en-IN");

}

// =====================================
// SIDEBAR NAVIGATION
// =====================================

document.addEventListener(

    "click",

    function (e) {

        const menu = e.target.closest(

            "[data-page]"

        );

        if (!menu) return;

        e.preventDefault();

        sidebar.classList.remove("show");

        const page = menu.dataset.page;

        switch (currentUser.role) {

            // =================================

            case "employee":

                switch (page) {

                    case "dashboard":

                        loadEmployeeDashboard();

                        break;

                    case "newRequest":

                        openNewRequestForm();

                        break;

                    case "history":

                        loadEmployeeHistory();

                        break;

                }

                break;

            // =================================

            case "finance":

                switch (page) {

                    case "dashboard":

                        loadFinanceDashboard();

                        break;

                    case "pending":

                        loadFinancePending();

                        break;

                    case "completed":

                        loadFinanceCompleted();

                        break;

                    case "newRequest":

                        openNewRequestForm();

                        break;

                }

                break;

            // =================================

            case "approver":

                switch (page) {

                    case "dashboard":

                        loadApproverDashboard();

                        break;

                    case "payments":

                        loadPendingPayments();

                        break;

                    case "completed":

                        loadCompletedPaymentsPage();

                        break;

                }

                break;

        }

    }

);