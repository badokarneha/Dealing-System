const API = "http://127.0.0.1:8000";


/* =========================================
   CREATE ACCOUNT
========================================= */

async function register() {

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
    };

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


        if (result.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            alert("Account created successfully!");

            /* Go to Dashboard */
            location.href = "dashboard.html";

        } else {

            alert(result.message || "Account creation failed.");

        }

    } catch (error) {

        console.error("Registration Error:", error);

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
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };


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


        if (result.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            /* Go to Dashboard */
            location.href = "dashboard.html";

        } else {

            alert(result.message || "Invalid email or password.");

        }

    } catch (error) {

        console.error("Login Error:", error);

        alert(
            "Unable to connect to the server. " +
            "Please make sure FastAPI is running."
        );
    }
}