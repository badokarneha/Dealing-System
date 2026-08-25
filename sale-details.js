const API = "http://127.0.0.1:8000";

const params =
    new URLSearchParams(location.search);

const id = params.get("id");


async function loadSale() {

    const response =
        await fetch(`${API}/api/sales/${id}`);

    const sale = await response.json();

    const container =
        document.getElementById("sale");

    container.innerHTML = `

        <div class="container">

            <div class="discount">
                ${sale.discount}% OFF
            </div>

            <h1>${sale.title}</h1>

            <h2>${sale.shop_name}</h2>

            <p class="location">
                📍 ${sale.location}
            </p>

            <p>
                ${sale.description}
            </p>

            <p>
                🗓 ${sale.start_date}
                → ${sale.end_date}
            </p>

            <button onclick="goHome()">
                Explore More Sales
            </button>

        </div>

    `;
}


function goHome() {

    location.href = "shops.html";
}


loadSale();