// ======================================
// USER
// ======================================

const user =
    JSON.parse(
        localStorage.getItem("user")
    );


// If user exists, show their name

if (user && user.name) {

    document.getElementById(
        "userName"
    ).textContent = user.name;


    document.getElementById(
        "welcomeName"
    ).textContent = user.name;

}


// ======================================
// SEARCH
// ======================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


searchInput.addEventListener(
    "input",
    function () {

        const search =
            this.value.toLowerCase();


        const cards =
            document.querySelectorAll(
                ".sale-card"
            );


        cards.forEach(
            function (card) {

                const text =
                    card.textContent
                        .toLowerCase();


                if (
                    text.includes(search)
                ) {

                    card.style.display =
                        "";

                } else {

                    card.style.display =
                        "none";

                }

            }
        );

    }
);


// ======================================
// SHARE SALE
// ======================================

function shareSale(id) {

    const url =
        window.location.origin +
        "/sale-details.html?id=" +
        id;


    if (
        navigator.share
    ) {

        navigator.share({

            title:
                "SaleFinder Sale",

            text:
                "Check out this amazing sale!",

            url: url

        });

    } else {

        navigator.clipboard
            .writeText(url)
            .then(
                function () {

                    alert(
                        "Sale link copied!"
                    );

                }
            );

    }

}


// ======================================
// LOGOUT
// ======================================

function logout() {

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";

}