const API = "http://127.0.0.1:8000";

async function loadSales() {

    const response = await fetch(`${API}/api/sales/`);
    const sales = await response.json();

    const container =
        document.getElementById("salesContainer");

    container.innerHTML = "";

    sales.slice(0, 6).forEach(sale => {

        container.innerHTML += `

        <div class="sale-card">

            <div class="discount">
                ${sale.discount}% OFF
            </div>

            <h3>${sale.title}</h3>

            <p>${sale.shop_name}</p>

            <p>${sale.location}</p>

            <button onclick="viewSale(${sale.id})">
                View Sale
            </button>

        </div>

        `;
    });
}


function viewSale(id) {

    window.location.href =
        `sale-details.html?id=${id}`;
}


loadSales();