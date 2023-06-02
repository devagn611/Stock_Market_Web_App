const stockCardsContainer = document.getElementById(
  "stockCardsContainer"
);
const addButton = document.getElementById("addButton");
const stockForm = document.getElementById("stockForm");
const symbolInput = document.getElementById("symbolInput");
const securityInput = document.getElementById("securityInput");
const searchResultsContainer = document.getElementById("searchResults");
const loader = document.getElementById("loader");
let securityData = [];

// Function to fetch security data from the JSON file
function fetchSecurityData() {
  fetch("./nse_symbol.json")
    .then((response) => response.json())
    .then((data) => {
      securityData = data.marketSymbol;

      securityInput.addEventListener("input", () => {
        const searchTerm = securityInput.value.toLowerCase();
        const filteredSecurities = securityData.filter((security) =>
          security["Security Name"].toLowerCase().includes(searchTerm)
        );
        displaySearchResults(filteredSecurities);
      });
    })
    .catch((error) => {
      console.error("Error fetching security data:", error);
    });
}

// Function to display the search results in the dropdown menu
function displaySearchResults(results) {
  searchResultsContainer.innerHTML = "";

  results.forEach((result) => {
    const searchResult = document.createElement("div");
    searchResult.classList.add("searchResult");
    searchResult.textContent = result["Security Name"];

    searchResult.addEventListener("click", () => {
      securityInput.value = result["Security Name"];
      symbolInput.value = result["Yahoo Code"];
      searchResultsContainer.innerHTML = "";
    });

    searchResultsContainer.appendChild(searchResult);
  });
}

// Call fetchSecurityData on page load
window.addEventListener("DOMContentLoaded", () => {
  fetchSecurityData();
});

// Function to create a new stock card
function createStockCard(symbol, price, percentageChange) {
  const stockCard = document.createElement("div");
  stockCard.classList.add("stockCard");

  const symbolElement = document.createElement("span");
  symbolElement.classList.add("symbol");
  symbolElement.textContent = symbol;

  const priceElement = document.createElement("span");
  priceElement.classList.add("price");
  priceElement.textContent = `Price: ${price}`;

  const percentageChangeElement = document.createElement("span");
  percentageChangeElement.classList.add("percentageChange");
  percentageChangeElement.textContent = `(${percentageChange}%)`;

  const chartContainer = document.createElement("div");
  chartContainer.classList.add("chartContainer");
  chartContainer.setAttribute("id", `chartContainer_${symbol}`);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    stockCardsContainer.removeChild(stockCard);
    // Perform any additional deletion logic as needed
  });

  stockCard.appendChild(symbolElement);
  stockCard.appendChild(priceElement);
  stockCard.appendChild(percentageChangeElement);
  stockCard.appendChild(chartContainer);
  stockCard.appendChild(deleteButton);

  stockCardsContainer.appendChild(stockCard);

  displayChart(symbol, chartContainer);
}

// Function to fetch stock data
function fetchStockData(symbol) {
  loader.style.display = "block"; // Show loading animation

  fetch(`/stockData/${symbol}`)
    .then((response) => response.json())
    .then((data) => {
      const { symbol, price, percentageChange } = data;

      // Create stock card
      createStockCard(symbol, price, percentageChange);

      loader.style.display = "none"; // Hide loading animation
    })
    .catch((error) => {
      console.error("Error fetching stock data:", error);
      loader.style.display = "none"; // Hide loading animation
    });
}

// Function to display the chart
function displayChart(symbol, container) {
  const newSymbol = symbol.replace(/\.NS$/, ""); // Remove ".NS" suffix using regex

  const chartContainerId = container.getAttribute("id");
  const chart = new TradingView.widget({
    // Create TradingView widget
    autosize: true,
    symbol: newSymbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#f1f3f6",
    enable_publishing: false,
    hide_side_toolbar: true, // Disable the side toolbar
    hide_top_toolbar: true, // Disable the top toolbar
    withdateranges: false,
    container_id: chartContainerId,
  });

  chart.draw();
}

// Event listener for stock form submission
stockForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const symbol = symbolInput.value.trim().toUpperCase();
  if (symbol) {
    fetchStockData(symbol);
    symbolInput.value = "";
  }
});

// Event listener for "Add Symbol" button click
addButton.addEventListener("click", () => {
  const symbol = prompt("Enter a stock symbol:");
  if (symbol) {
    fetchStockData(symbol.toUpperCase());
  }
});

function updateStockPrices() {
  const stockCards = document.getElementsByClassName("stockCard");
  for (let i = 0; i < stockCards.length; i++) {
    const stockCard = stockCards[i];
    const symbolElement = stockCard.querySelector(".symbol");
    const priceElement = stockCard.querySelector(".price");
    const percentageChangeElement =
      stockCard.querySelector(".percentageChange");
    const symbol = symbolElement.textContent;

    fetch(`/stockData/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        const { price, percentageChange } = data;
        priceElement.textContent = `Price: ${price}`;
        percentageChangeElement.textContent = `(${percentageChange}%)`;
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error);
      });
  }
}

setInterval(updateStockPrices, 2000);

// new script for share
function parseWatchlistFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const symbols = urlParams.get("symbols");
  if (symbols) {
    const symbolList = symbols.split(",");
    symbolList.forEach((symbol) => {
      fetchStockData(symbol.toUpperCase());
    });
  }
}

// Save watchlist symbols to URL parameters
function saveWatchlistToURL() {
  const symbols = Array.from(stockCardsContainer.children).map((card) => {
    return card.querySelector(".symbol").textContent;
  });
  const symbolParam = symbols.join(",");
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("symbols", symbolParam);
  const newURL = `${window.location.origin}${
    window.location.pathname
  }?${urlParams.toString()}`;
  window.history.replaceState({}, "", newURL);
}

// Load watchlist from URL on page load
window.addEventListener("DOMContentLoaded", () => {
  parseWatchlistFromURL();
});

// Save watchlist to URL when adding or deleting symbols
stockCardsContainer.addEventListener("DOMNodeInserted", () => {
  saveWatchlistToURL();
});
stockCardsContainer.addEventListener("DOMNodeRemoved", () => {
  saveWatchlistToURL();
});

// Event listener for share button click
shareButton.addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const symbols = urlParams.get("symbols");
  const shareUrl = `${window.location.origin}${window.location.pathname}?symbols=${symbols}`;
  const shareOption = prompt(
    "Share or copy the watchlist URL:",
    shareUrl
  );
  if (shareOption === "share") {
    // Implement your logic to share the URL
    alert("URL shared");
  } else if (shareOption === "copy") {
    // Implement your logic to copy the URL to the clipboard
    alert("URL copied to clipboard");
  }
});
