// =========================================
// SHUBHAN PAYMENT PORTAL
// request.js
// PART 1
// =========================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const requestCollection = collection(db, "requests");

// =========================================
// CREATE REQUEST
// =========================================

export async function createRequest(data) {

    try {

       const isFinanceHead =
    data.requestedByUsername === "mustafa";

const request = {

    requestedBy: data.requestedBy,

    requestedByUsername: data.requestedByUsername,

    expenseType: data.expenseType,

    payTo: data.payTo,

    amount: Number(data.amount),

    description: data.description,

    documents: data.documents || [],

// Backward compatibility
documentUrl:
    data.documents?.length
        ? data.documents[0].url
        : "",

publicId:
    data.documents?.length
        ? data.documents[0].publicId
        : "",
    // ✅ Finance Head skips Finance Approval
    status: isFinanceHead
        ? "Pending Payment"
        : "Pending Finance",

    financeApprovedBy: isFinanceHead
        ? data.requestedBy
        : "",

    completedBy: "",

    financeApprovedAt: isFinanceHead
        ? serverTimestamp()
        : null,

    completedAt: null,

    createdAt: serverTimestamp()

};

        const docRef = await addDoc(requestCollection, request);

        return {

            success: true,

            id: docRef.id

        };

    } catch (error) {

        console.error(error);

        return {

            success: false,

            error

        };

    }

}

// =========================================
// GET EMPLOYEE REQUESTS
// =========================================

export async function getEmployeeRequests(username) {

    try {

        const q = query(

            requestCollection,

            where("requestedByUsername", "==", username),

            orderBy("createdAt", "desc")

        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    } catch (error) {

        console.error(error);

        return [];

    }

}

// =========================================
// GET REQUEST BY ID
// =========================================

export async function getRequest(id) {

    try {

        const snapshot = await getDoc(

            doc(db, "requests", id)

        );

        if (!snapshot.exists()) {

            return null;

        }

        return {

            id: snapshot.id,

            ...snapshot.data()

        };

    }

    catch (error) {

        console.error(error);

        return null;

    }

}

// =========================================
// LIVE REQUEST LISTENER
// =========================================

export function listenEmployeeRequests(

    username,

    callback

) {

    const q = query(

        requestCollection,

        where(

            "requestedByUsername",

            "==",

            username

        ),

        orderBy(

            "createdAt",

            "desc"

        )

    );

    return onSnapshot(q, (snapshot) => {

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        callback(requests);

    });

}

// =========================================
// TOTAL AMOUNT
// =========================================

export function calculateTotal(requests) {

    let total = 0;

    requests.forEach((item) => {

        total += Number(item.amount);

    });

    return total;

}

// =========================================
// STATUS COUNTS
// =========================================

export function getCounts(requests) {

    let pending = 0;

    let approved = 0;

    let completed = 0;

    requests.forEach((item) => {

        if (item.status === "Pending Finance") {

            pending++;

        }

        else if (item.status === "Pending Payment") {

            approved++;

        }

        else if (item.status === "Completed") {

            completed++;

        }

    });

    return {

        pending,

        approved,

        completed,

        totalAmount: calculateTotal(requests)

    };

}

// =========================================
// DATE FORMAT
// =========================================

export function formatDate(timestamp) {

    if (!timestamp) {

        return "-";

    }

    const date = timestamp.toDate();

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}

// =========================================
// request.js
// PART 2
// Finance Functions
// =========================================

import {
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";



// =========================================
// GET ALL REQUESTS
// =========================================

export async function getAllRequests() {

    try {

        const q = query(
            requestCollection,
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}



// =========================================
// GET PENDING FINANCE REQUESTS
// =========================================

export async function getPendingFinanceRequests() {

    try {

        const q = query(

            requestCollection,

            where(
                "status",
                "==",
                "Pending Finance"
            ),

            orderBy(
                "createdAt",
                "desc"
            )

        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}



// =========================================
// APPROVE REQUEST
// =========================================

export async function approveRequest(

    requestId,

    approvedBy

) {

    try {

        const requestRef = doc(

            db,

            "requests",

            requestId

        );

        await updateDoc(requestRef, {

            status: "Pending Payment",

            financeApprovedBy: approvedBy,

            financeApprovedAt: serverTimestamp()

        });

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}



// =========================================
// DECLINE REQUEST
// =========================================

export async function declineRequest(
    requestId,
    declinedBy
) {

    try {

        const requestRef = doc(
            db,
            "requests",
            requestId
        );

        await updateDoc(requestRef, {

            status: "Declined",

            declinedBy,

            declinedAt: serverTimestamp()

        });

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}



// =========================================
// UPDATE REQUEST STATUS
// =========================================

export async function updateRequestStatus(

    requestId,

    status

) {

    try {

        await updateDoc(

            doc(

                db,

                "requests",

                requestId

            ),

            {

                status: status

            }

        );

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}



// =========================================
// LIVE LISTENER
// FINANCE DASHBOARD
// =========================================

export function listenFinanceRequests(

    callback

) {

    const q = query(

        requestCollection,

        orderBy(

            "createdAt",

            "desc"

        )

    );

    return onSnapshot(

        q,

        (snapshot) => {

            const requests = [];

            snapshot.forEach(

                (docSnap) => {

                    requests.push({

                        id: docSnap.id,

                        ...docSnap.data()

                    });

                }

            );

            callback(

                requests

            );

        }

    );

}



// =========================================
// LIVE LISTENER
// ONLY PENDING FINANCE
// =========================================

export function listenPendingFinance(

    callback

) {

    const q = query(

        requestCollection,

        where(

            "status",

            "==",

            "Pending Finance"

        ),

        orderBy(

            "createdAt",

            "desc"

        )

    );

    return onSnapshot(

        q,

        (snapshot) => {

            const requests = [];

            snapshot.forEach(

                (docSnap) => {

                    requests.push({

                        id: docSnap.id,

                        ...docSnap.data()

                    });

                }

            );

            callback(

                requests

            );

        }

    );

}



// =========================================
// DELETE REQUEST
// =========================================

export async function deleteRequest(

    requestId

) {

    try {

        await deleteDoc(

            doc(

                db,

                "requests",

                requestId

            )

        );

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}

// =========================================
// request.js
// PART 3A
// APPROVER FUNCTIONS
// =========================================


// =========================================
// GET PENDING PAYMENTS
// =========================================

export async function getPendingPayments() {

    try {

        const q = query(

            requestCollection,

            where(
                "status",
                "==",
                "Pending Payment"
            ),

            orderBy(
                "financeApprovedAt",
                "asc"
            )

        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}



// =========================================
// GET COMPLETED PAYMENTS
// =========================================

export async function getCompletedPayments() {

    try {

        const q = query(

            requestCollection,

            where(
                "status",
                "==",
                "Completed"
            ),

            orderBy(
                "completedAt", "desc"
            )

        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}



// =========================================
// COMPLETE PAYMENT
// =========================================

export async function completePayment(

    requestId,

    completedBy

) {

    try {

        const requestRef = doc(

            db,

            "requests",

            requestId

        );

        await updateDoc(

            requestRef,

            {

                status: "Completed",

                completedBy: completedBy,

                completedAt: serverTimestamp()

            }

        );

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}



// =========================================
// LIVE LISTENER
// PENDING PAYMENTS
// =========================================

export function listenPendingPayments(callback) {

    const q = query(
        requestCollection,
        where("status", "==", "Pending Payment")
    );

    return onSnapshot(q, (snapshot) => {

        const requests = [];

        snapshot.forEach((docSnap) => {
            requests.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        callback(requests);
    });
}

// =========================================
// LIVE LISTENER
// COMPLETED PAYMENTS
// =========================================

export function listenCompletedPayments(callback) {

    const q = query(
        requestCollection,
        where("status", "==", "Completed")
    );

    return onSnapshot(q, (snapshot) => {
        const requests = [];

        snapshot.forEach(docSnap => {
            requests.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        // sort manually (safe)
        requests.sort((a, b) => {
            return (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0);
        });

        callback(requests);
    });
}

// =========================================
// GET REQUESTS BY STATUS
// =========================================

export async function getRequestsByStatus(

    status

) {

    try {

        const q = query(

            requestCollection,

            where(

                "status",

                "==",

                status

            ),

            orderBy(

                "createdAt",

                "desc"

            )

        );

        const snapshot = await getDocs(q);

        const requests = [];

        snapshot.forEach((docSnap) => {

            requests.push({

                id: docSnap.id,

                ...docSnap.data()

            });

        });

        return requests;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}