const user =
    JSON.parse(
        localStorage.getItem("user")
    );


if (!user) {

    location.href = "login.html";

}


document.getElementById("name")
    .textContent = user.name;


document.getElementById("email")
    .textContent = user.email;


document.getElementById("role")
    .textContent =
        user.role.toUpperCase();


function logout() {

    localStorage.removeItem("user");

    location.href = "index.html";
}