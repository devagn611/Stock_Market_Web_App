const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static(__dirname));

app.get('/stockData/:symbol', async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const apiUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=financialData`;

    const response = await axios.get(apiUrl);
    const stockData = response.data.quoteSummary.result[0].financialData;
    const currentPrice = stockData.currentPrice.raw;
    const stockSymbol = symbol;
    const chartUrl = `https://chart.yahoo.com/t?s=${symbol}`;

    const stockDetails = {
      symbol: stockSymbol,
      price: currentPrice,
      chart: chartUrl
    };

    res.json(stockDetails);
  } catch (error) {
    console.error('Error retrieving stock data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/stock.html`);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
