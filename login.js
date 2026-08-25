const API = "http://127.0.0.1:8000";


async function register() {

    const data = {

        name:
            document.getElementById("name").value,

        email:
            document.getElementById("email").value,

        password:
            document.getElementById("password").value,

        role:
            document.getElementById("role").value

    };


    const response = await fetch(
        `${API}/api/auth/register`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        }
    );


    const result =
        await response.json();


    if (result.success) {

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );

        alert("Account created!");

        location.href = "profile.html";

    } else {

        alert(result.message);

    }
}


async function login() {

    const data = {

        email:
            document.getElementById("email").value,

        password:
            document.getElementById("password").value

    };


    const response = await fetch(
        `${API}/api/auth/login`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify(data)
        }
    );


    const result =
        await response.json();


    if (result.success) {

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );

        location.href =
            "profile.html";

    } else {

        alert(result.message);

    }
}