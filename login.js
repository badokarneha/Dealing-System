const API = "http://127.0.0.1:8000";


/* =========================================
   SHOW LOGIN
========================================= */

function showLogin() {

    document.getElementById("loginForm").style.display = "block";

    document.getElementById("registerForm").style.display = "none";

    document.title = "SaleFinder - Login";
}


/* =========================================
   SHOW REGISTER
========================================= */

function showRegister() {

    document.getElementById("loginForm").style.display = "none";

    document.getElementById("registerForm").style.display = "block";

    document.title = "SaleFinder - Create Account";
}


/* =========================================
   CREATE ACCOUNT
========================================= */

async function register() {

    const data = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value.trim(),
        city: document.getElementById("city").value.trim(),
        role: document.getElementById("role").value
    };


    /* Basic validation */

    if (
        !data.name ||
        !data.email ||
        !data.password ||
        !data.phone ||
        !data.city
    ) {

        alert("Please fill all fields.");

        return;
    }


    try {

        const response = await fetch(
            `${API}/api/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result = await response.json();

        console.log("Register Response:", result);


        if (result.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("Account created successfully!");

            window.location.href = "dashboard.html";

        } else {

            alert(
                result.message ||
                "Account creation failed."
            );
        }


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        alert(
            "Unable to connect to the server. " +
            "Please make sure FastAPI is running."
        );
    }
}


/* =========================================
   LOGIN
========================================= */

async function login() {

    const data = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };


    /* Basic validation */

    if (!data.email || !data.password) {

        alert("Please enter email and password.");

        return;
    }


    try {

        const response = await fetch(
            `${API}/api/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );


        const result = await response.json();

        console.log("Login Response:", result);


        if (result.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("Login successful!");

            window.location.href = "dashboard.html";

        } else {

            alert(
                result.message ||
                "Invalid email or password."
            );
        }


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        alert(
            "Unable to connect to the server. " +
            "Please make sure FastAPI is running."
        );
    }
}


/* =========================================
   DEFAULT PAGE
========================================= */

showLogin();