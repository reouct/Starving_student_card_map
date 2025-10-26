const deals = require("./sampleDealsList");

function postDeal(deal) {
  fetch("http://localhost:3000/api/deal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deal),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Response from Express endpoint:", data);
    })
    .catch((error) => {
      console.error("Error submitting data:", error);
    });
}

for (let i = 0; i < deals.length; i++) {
  postDeal(deals[i]);
}
