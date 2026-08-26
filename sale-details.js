const API =
    "http://127.0.0.1:8000";


const params =
    new URLSearchParams(
        window.location.search
    );


const saleId =
    params.get("id");


let currentSale = null;


// LOAD SALE

async function loadSale() {

    const container =
        document.getElementById(
            "sale"
        );


    if (!saleId) {

        showError(
            "No sale selected."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/api/sales/${saleId}`
            );


        if (!response.ok) {

            throw new Error(
                "Sale not found"
            );

        }


        const sale =
            await response.json();


        currentSale = sale;


        renderSale(sale);


        startCountdown(
            sale.end_date
        );


    } catch (error) {

        console.error(error);

        showError(
            "Unable to load this sale."
        );

    }

}


// RENDER

function renderSale(sale) {

    document.getElementById(
        "sale"
    ).innerHTML = `

        <div class="sale-wrapper">


            <section class="sale-hero">

                <div class="hero-content">

                    <div class="live">

                        <i></i>

                        SALE LIVE

                    </div>


                    <div class="discount">

                        ${sale.discount}% OFF

                    </div>


                    <h1 class="title">

                        ${escapeHTML(
        sale.title
    )}

                    </h1>


                    <p class="shop-name">

                        🏪

                        ${escapeHTML(
        sale.shop_name
    )}

                    </p>

                </div>

            </section>



            <section class="sale-body">


                <div>

                    <p class="label">
                        ABOUT THIS SALE
                    </p>


                    <p class="description">

                        ${escapeHTML(
        sale.description ||
        "Grab this amazing offer before it ends!"
    )}

                    </p>


                    <div class="info-grid">


                        <div class="info">

                            <div class="info-icon">
                                🗓️
                            </div>

                            <div>

                                <small>
                                    START DATE
                                </small>

                                <strong>
                                    ${sale.start_date}
                                </strong>

                            </div>

                        </div>


                        <div class="info">

                            <div class="info-icon">
                                ⏳
                            </div>

                            <div>

                                <small>
                                    END DATE
                                </small>

                                <strong>
                                    ${sale.end_date}
                                </strong>

                            </div>

                        </div>


                        <div class="info">

                            <div class="info-icon">
                                🏷️
                            </div>

                            <div>

                                <small>
                                    CATEGORY
                                </small>

                                <strong>
                                    ${escapeHTML(
        sale.category
    )}
                                </strong>

                            </div>

                        </div>


                        <div class="info">

                            <div class="info-icon">
                                📍
                            </div>

                            <div>

                                <small>
                                    LOCATION
                                </small>

                                <strong>
                                    ${escapeHTML(
        sale.location
    )}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>



                <aside class="offer-box">

                    <h3>
                        Offer ends in
                    </h3>


                    <div class="countdown">


                        <div class="time">

                            <strong id="days">
                                00
                            </strong>

                            <small>
                                DAYS
                            </small>

                        </div>


                        <div class="time">

                            <strong id="hours">
                                00
                            </strong>

                            <small>
                                HOURS
                            </small>

                        </div>


                        <div class="time">

                            <strong id="minutes">
                                00
                            </strong>

                            <small>
                                MINUTES
                            </small>

                        </div>

                    </div>


                    <div class="location">

                        <small>
                            SHOP LOCATION
                        </small>

                        <p>
                            📍
                            ${escapeHTML(
        sale.location
    )}
                        </p>

                    </div>


                    <div class="actions">

                        <button
                            class="share"
                            onclick="shareSale()"
                        >
                            ↗ Share
                        </button>


                        <button
                            class="save"
                            onclick="saveSale()"
                        >
                            ♡ Save
                        </button>

                    </div>

                </aside>

            </section>


            <footer class="sale-footer">

                <span>
                    SaleFinder • Local deals made easy
                </span>

                <span>
                    ✓ Offer information provided by shop
                </span>

            </footer>


        </div>

    `;

}


// COUNTDOWN

function startCountdown(endDate) {

    const end =
        new Date(endDate);


    function update() {

        const now =
            new Date();


        const difference =
            end - now;


        if (difference <= 0) {

            document.getElementById(
                "days"
            ).textContent = "00";

            document.getElementById(
                "hours"
            ).textContent = "00";

            document.getElementById(
                "minutes"
            ).textContent = "00";

            return;

        }


        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (difference /
                    (1000 * 60 * 60)) % 24
            );


        const minutes =
            Math.floor(
                (difference /
                    (1000 * 60)) % 60
            );


        document.getElementById(
            "days"
        ).textContent =
            String(days).padStart(2, "0");


        document.getElementById(
            "hours"
        ).textContent =
            String(hours).padStart(2, "0");


        document.getElementById(
            "minutes"
        ).textContent =
            String(minutes).padStart(2, "0");

    }


    update();

    setInterval(update, 60000);

}


// SHARE

async function shareSale() {

    if (!currentSale) return;


    if (navigator.share) {

        await navigator.share({

            title:
            currentSale.title,

            text:
                `${currentSale.discount}% OFF at ${currentSale.shop_name}`,

            url:
            window.location.href

        });

    } else {

        await navigator.clipboard
            .writeText(
                window.location.href
            );

        alert(
            "Sale link copied!"
        );

    }

}


// SAVE

function saveSale() {

    if (!currentSale) return;


    let saved =
        JSON.parse(
            localStorage.getItem(
                "savedSales"
            )
        ) || [];


    if (!saved.includes(currentSale.id)) {

        saved.push(currentSale.id);


        localStorage.setItem(
            "savedSales",
            JSON.stringify(saved)
        );


        alert(
            "Sale saved ❤️"
        );

    } else {

        alert(
            "Already saved ❤️"
        );

    }

}


// ERROR

function showError(message) {

    document.getElementById(
        "sale"
    ).innerHTML = `

        <div class="loading">

            <h2>
                Oops! 😕
            </h2>

            <br>

            <p>
                ${message}
            </p>

            <br>

            <a href="explore.html">
                ← Explore other sales
            </a>

        </div>

    `;

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


loadSale();