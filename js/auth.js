// ==========================================
// SHUBHAN PAYMENT PORTAL
// auth.js
// PART 1
// ==========================================

import { db } from "./firebase.js";

import {

    collection,
    query,
    where,
    getDocs

} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {

    showLoader,
    hideLoader,
    showToast,
    showDashboard

} from "./app.js";



const usersCollection = collection(

    db,

    "users"

);



// ==========================================
// LOGIN
// ==========================================

export async function loginUser() {

    const username = document

        .getElementById("username")

        .value

        .trim()

        .toLowerCase();

    const password = document
    .getElementById("password")
    .value;



    if (

    username === "" ||

    password.trim() === ""

) {

    showToast(

        "Enter username and password."

    );

    return;

}



    showLoader();



    try {

        const q = query(

            usersCollection,

            where(

                "username",

                "==",

                username

            )

        );



        const snapshot = await getDocs(q);



        if (

            snapshot.empty

        ) {

            hideLoader();

            showToast(

                "User not found."

            );

            return;

        }



        let user = null;



        snapshot.forEach(

            (doc) => {

                user = {

                    id: doc.id,

                    ...doc.data()

                };

            }

        );



       if (

    String(user.password)

    !==

    password

) {

    hideLoader();

    showToast(

        "Incorrect password."

    );

    return;

}



        localStorage.setItem(

            "loggedUser",

            JSON.stringify(user)

        );



        hideLoader();



        showToast(

            `Welcome ${user.name}`

        );



        showDashboard(

            user

        );

    }

    catch (error) {

        console.error(error);



        hideLoader();



        showToast(

            "Unable to login."

        );

    }

}



// ==========================================
// LOGIN BUTTON
// ==========================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (e) {

        e.preventDefault();

        loginUser();

    });

}

// ==========================================
// ENTER KEY
// ==========================================

// ==========================================
// TOGGLE PASSWORD VISIBILITY
// ==========================================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (passwordInput && togglePassword) {

    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            passwordInput.type = "password";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

}