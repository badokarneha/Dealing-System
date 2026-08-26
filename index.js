const API = "http://127.0.0.1:8000";


// ===============================
// LOAD SALES
// ===============================

async function loadSales() {

    const container =
        document.getElementById("salesContainer");

    if (!container) {
        console.error("salesContainer not found");
        return;
    }

    // Loading message
    container.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            Loading latest sales...
        </div>
    `;

    try {

        const response =
            await fetch(`${API}/api/sales/`);

        if (!response.ok) {
            throw new Error(
                `Server error: ${response.status}`
            );
        }

        const sales =
            await response.json();

        container.innerHTML = "";

        // Show maximum 6 sales
        const latestSales =
            sales.slice(0, 6);

        if (latestSales.length === 0) {

            container.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-tag"></i>
                    No sales available right now.
                </div>
            `;

            return;
        }


        latestSales.forEach(sale => {

            const card =
                document.createElement("div");

            card.className = "sale-card";


            card.innerHTML = `

                <div class="discount">
                    ${sale.discount}% OFF
                </div>

                <h3>
                    ${sale.title}
                </h3>

                <p>
                    <i class="fas fa-store"></i>
                    ${sale.shop_name}
                </p>

                <p>
                    <i class="fas fa-map-marker-alt"></i>
                    ${sale.location}
                </p>

                <button
                    class="view-sale-btn"
                    onclick="viewSale(${sale.id})"
                >
                    View Sale
                    <i class="fas fa-arrow-right"></i>
                </button>

            `;


            container.appendChild(card);

        });

    }

    catch (error) {

        console.error(
            "Error loading sales:",
            error
        );

        container.innerHTML = `

            <div class="loading-message error-message">

                <i class="fas fa-exclamation-triangle"></i>

                <span>
                    Unable to load sales.
                </span>

                <button
                    onclick="loadSales()"
                    class="retry-btn"
                >
                    Try Again
                </button>

            </div>

        `;

    }

}


// ===============================
// VIEW SALE DETAILS
// ===============================

function viewSale(id) {

    if (!id) {
        console.error("Sale ID is missing");
        return;
    }

    window.location.href =
        `sale-details.html?id=${id}`;

}


// ===============================
// LOAD WHEN PAGE IS READY
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSales();

    }
);