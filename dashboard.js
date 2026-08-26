const API = "http://127.0.0.1:8000";


// ============================
// GET LOGGED-IN USER
// ============================

const user =
    JSON.parse(
        localStorage.getItem("user")
    );


// If user is not logged in
if (!user) {

    window.location.href =
        "login.html";

}


// ============================
// SHOW USER NAME
// ============================

document.getElementById("userName")
    .textContent = user.name;

document.getElementById("welcomeName")
    .textContent = user.name;


// ============================
// LOAD SALES
// ============================

async function loadSales() {

    try {

        const response =
            await fetch(
                `${API}/api/sales/shop/${user.id}`
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch sales"
            );

        }


        const sales =
            await response.json();


        displaySales(sales);


        updateStats(sales);


    } catch (error) {

        console.error(error);

        document.getElementById(
            "salesContainer"
        ).innerHTML = `

            <div class="loading">

                <h3>
                    Unable to load sales
                </h3>

                <p>
                    Make sure your backend is running.
                </p>

            </div>

        `;

    }

}


// ============================
// DISPLAY SALES
// ============================

function displaySales(sales) {

    const container =
        document.getElementById(
            "salesContainer"
        );


    if (sales.length === 0) {

        container.innerHTML = `

            <div class="loading">

                <h3>
                    No sales posted yet 🎯
                </h3>

                <p>
                    Create your first offer and
                    start attracting customers.
                </p>

                <br>

                <a
                    href="post-sale.html"
                    style="
                    color:#6c4df6;
                    text-decoration:none;
                    font-weight:600;
                    "
                >
                    + Create Sale
                </a>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    sales.forEach((sale, index) => {

        const bannerClass =
            index % 2 === 0
                ? ""
                : "green-banner";


        container.innerHTML += `

            <div class="sale-card">

                <div
                    class="sale-banner
                    ${bannerClass}"
                >

                    <div class="discount">
                        ${sale.discount}% OFF
                    </div>

                    <span class="sale-label">
                        ACTIVE
                    </span>

                </div>


                <div class="sale-body">

                    <h3>
                        ${escapeHTML(sale.title)}
                    </h3>

                    <p class="shop-name">
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
                            📅
                            ${sale.end_date}
                        </span>

                    </div>


                    <div class="sale-actions">

                        <button
                            onclick="viewSale(${sale.id})"
                            class="view"
                        >
                            View
                        </button>

                        <button
                            onclick="shareSale(
                                '${escapeJS(sale.title)}',
                                ${sale.id}
                            )"
                        >
                            Share
                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


// ============================
// UPDATE STATISTICS
// ============================

function updateStats(sales) {

    document.getElementById(
        "totalSales"
    ).textContent = sales.length;


    const today =
        new Date();


    const activeSales =
        sales.filter(sale => {

            const end =
                new Date(sale.end_date);

            return end >= today;

        });


    document.getElementById(
        "activeSales"
    ).textContent =
        activeSales.length;

}


// ============================
// SEARCH
// ============================

document
    .getElementById("search")
    .addEventListener(
        "input",
        function () {

            const keyword =
                this.value.toLowerCase();


            document
                .querySelectorAll(
                    ".sale-card"
                )
                .forEach(card => {

                    const text =
                        card.textContent
                            .toLowerCase();


                    card.style.display =
                        text.includes(keyword)
                            ? ""
                            : "none";

                });

        }
    );


// ============================
// VIEW SALE
// ============================

function viewSale(id) {

    window.location.href =
        `sale-details.html?id=${id}`;

}


// ============================
// SHARE SALE
// ============================

async function shareSale(title, id) {

    const url =
        `${window.location.origin}/sale-details.html?id=${id}`;


    if (navigator.share) {

        await navigator.share({

            title: title,

            text:
                `Check out this amazing sale: ${title}`,

            url: url

        });

    } else {

        await navigator.clipboard.writeText(
            url
        );

        alert(
            "Sale link copied!"
        );

    }

}


// ============================
// LOGOUT
// ============================

function logout() {

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


// ============================
// SECURITY HELPERS
// ============================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeJS(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", " ");

}


// ============================
// START
// ============================

loadSales();