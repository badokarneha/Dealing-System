const API = "http://127.0.0.1:8000";

document
    .getElementById("saleForm")
    .addEventListener("submit", async function(e) {

        e.preventDefault();

        const sale = {

            shop_name:
                document.getElementById("shop").value,

            title:
                document.getElementById("title").value,

            category:
                document.getElementById("category").value,

            discount:
                Number(
                    document.getElementById("discount").value
                ),

            location:
                document.getElementById("location").value,

            start_date:
                document.getElementById("start").value,

            end_date:
                document.getElementById("end").value,

            description:
                document.getElementById("description").value,

            image: "",

            owner_id: 1
        };


        const response = await fetch(
            `${API}/api/sales/`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(sale)
            }
        );


        const result =
            await response.json();


        if (result.success) {

            alert("Sale published successfully!");

            location.href =
                "dashboard.html";

        } else {

            alert("Something went wrong.");

        }

    });