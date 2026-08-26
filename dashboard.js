const API = "http://127.0.0.1:8000";


// GET USER

const user =
    JSON.parse(
        localStorage.getItem("user")
    );


if (!user) {

    window.location.href =
        "login.html";

}


// USER NAME

document.getElementById(
    "userName"
).textContent = user.name;


document.getElementById(
    "welcomeName"
).textContent = user.name;


// LOAD SALES

async function loadSales() {

    try {

        const response =
            await fetch(
                `${API}/api/sales/shop/${user.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load sales"
            );

        }


        const sales =
            await response.json();


        renderSales(sales);

        updateStats(sales);


    } catch (error) {

        console.error(error);

        document.getElementById(
            "salesContainer"
        ).innerHTML = `

            <div class="loading">

                Unable to connect
                to the server.

                <br><br>

                Make sure FastAPI is running.

            </div>

        `;

    }

}


// RENDER

function renderSales(sales) {

    const container =
        document.getElementById(
            "salesContainer"
        );


    if (!sales.length) {

        container.innerHTML = `

            <div class="loading">

                <h3>
                    No sales yet 🎯
                </h3>

                <br>

                <a href="post-sale.html">
                    Create your first sale →
                </a>

            </div>

        `;

        return;

    }


    container.innerHTML =
        sales.map(
            (sale, index) => `

        <div class="sale-card">

            <div class="
                sale-image
                ${index % 2
                ? "green"
                : ""}
            ">

                <div class="discount">
                    ${sale.discount}% OFF
                </div>

                <span class="active">
                    ACTIVE
                </span>

            </div>


            <div class="sale-info">

                <h3>
                    ${escapeHTML(
                sale.title
            )}
                </h3>

                <p class="shop">
                    ${escapeHTML(
                sale.shop_name
            )}
                </p>


                <div class="sale-meta">

                    <span>
                        📍
                        ${escapeHTML(
                sale.location
            )}
                    </span>

                    <span>
                        Until
                        ${sale.end_date}
                    </span>

                </div>


                <div class="card-buttons">

                    <button
                        class="view"
                        onclick="
                        viewSale(${sale.id})
                        "
                    >
                        View Details
                    </button>

                    <button
                        onclick="
                        shareSale(${sale.id})
                        "
                    >
                        Share
                    </button>

                </div>

            </div>

        </div>

    `
        ).join("");

}


// STATS

function updateStats(sales) {

    document.getElementById(
        "totalSales"
    ).textContent =
        sales.length;


    const today =
        new Date();


    const active =
        sales.filter(
            sale =>
                new Date(
                    sale.end_date
                ) >= today
        );


    document.getElementById(
        "activeSales"
    ).textContent =
        active.length;

}


// SEARCH

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            const value =
                this.value
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".sale-card"
                )
                .forEach(card => {

                    card.style.display =
                        card.textContent
                            .toLowerCase()
                            .includes(value)
                            ? ""
                            : "none";

                });

        }
    );


// VIEW

function viewSale(id) {

    window.location.href =
        `sale-details.html?id=${id}`;

}


// SHARE

async function shareSale(id) {

    const url =
        `${window.location.origin}`
        + `/sale-details.html?id=${id}`;


    if (navigator.share) {

        await navigator.share({

            title:
                "Amazing Sale on SaleFinder",

            url: url

        });

    } else {

        await navigator.clipboard
            .writeText(url);

        alert(
            "Sale link copied!"
        );

    }

}


// LOGOUT

function logout() {

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


// SECURITY

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// START

loadSales();