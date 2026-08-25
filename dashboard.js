const API = "http://127.0.0.1:8000";

const ownerId = 1;


async function loadDashboard() {

    const response =
        await fetch(
            `${API}/api/sales/shop/${ownerId}`
        );

    const sales =
        await response.json();


    document.getElementById("total")
        .textContent = sales.length;


    const container =
        document.getElementById("sales");

    container.innerHTML = "";


    sales.forEach(sale => {

        container.innerHTML += `

        <div class="sale">

            <div class="discount">
                ${sale.discount}% OFF
            </div>

            <h2>${sale.title}</h2>

            <p>${sale.description}</p>

            <p>
                ${sale.start_date}
                →
                ${sale.end_date}
            </p>

        </div>

        `;
    });
}


loadDashboard();
