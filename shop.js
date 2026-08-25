const API = "http://127.0.0.1:8000";

let allSales = [];

async function getSales() {

    const response =
        await fetch(`${API}/api/sales/`);

    allSales = await response.json();

    displaySales(allSales);
}


function displaySales(sales) {

    const container =
        document.getElementById("sales");

    container.innerHTML = "";

    sales.forEach(sale => {

        container.innerHTML += `

        <div class="card">

            <div class="discount">
                ${sale.discount}% OFF
            </div>

            <h2>${sale.title}</h2>

            <h3>${sale.shop_name}</h3>

            <p>${sale.category}</p>

            <p>📍 ${sale.location}</p>

            <button
                onclick="openSale(${sale.id})">
                View Details
            </button>

        </div>

        `;
    });
}


function openSale(id) {

    location.href =
        `sale-details.html?id=${id}`;
}


document
    .getElementById("search")
    .addEventListener("input", function () {

        const keyword =
            this.value.toLowerCase();

        const filtered =
            allSales.filter(sale =>
                sale.title.toLowerCase()
                    .includes(keyword) ||

                sale.shop_name.toLowerCase()
                    .includes(keyword) ||

                sale.category.toLowerCase()
                    .includes(keyword)
            );

        displaySales(filtered);
    });


getSales();