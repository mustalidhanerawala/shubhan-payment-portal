// ========================================
// SHUBHAN PAYMENT PORTAL
// FIREBASE CONFIGURATION
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {

    apiKey: "AIzaSyBf7xDHc0UC1RzA_bsSNUHkwBKCXJn6frA",

    authDomain: "shubhan-payment-portal-ebf77.firebaseapp.com",

    projectId: "shubhan-payment-portal-ebf77",

    storageBucket: "shubhan-payment-portal-ebf77.firebasestorage.app",

    messagingSenderId: "183037097474",

    appId: "1:183037097474:web:418967067ba1357317191b"

};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// INITIALIZE FIRESTORE
// ========================================

const db = getFirestore(app);


// ========================================
// EXPORT
// ========================================

export { app, db };