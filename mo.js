const axios = require('axios');
const WebSocket = require('ws');

const symbols = {}; // Object to store all symbol data
const alerts = {}; // Object to store all symbol data

let requestCount = 0; // Counter for the number of requests
const REQUEST_LIMIT = 2200; // Request limit per minute
const TIME_FRAME = 60000; // 1 minute in milliseconds
const REQUEST_DELAY = 50; // Delay between requests in milliseconds

// Function to initialize and update symbol data
async function initializeSymbolData(symbol) {
    if (!symbols[symbol]) {
        symbols[symbol] = {
            klines: {},
            umbral: {},
            MA20: {},
            MA50: {},
            prevVolume: {},
            trend: {}, // To store the trend information
            ranges: {}
        };
    }

    if (!alerts[symbol]) {
        alerts[symbol] = {};
    }

    const timeFrames = ['1m', '5m', '15m', '30m', '1h'];
    const metodos = ['pwc', 'vol', 'ran', 'mas'];

    for (const tf of timeFrames) {
        const klines = await getKlines(symbol, tf);
        symbols[symbol].klines[tf] = klines.map(kline => [kline[0], kline[1], kline[2], kline[3], kline[4], kline[5]]); // Store only required data
        updateMovingAverages(symbol, tf);
        updateUmbral(symbol, tf);
        encontrarNivelesSoporteResistencia(symbol, klines, 200, tf);
        symbols[symbol].trend[tf] = { ma20: null, ma50: null }; // Initialize trend
        for (const met of metodos) {
            if (!alerts[symbol][met]) {
                alerts[symbol][met] = {};
            }
            alerts[symbol][met][tf] = false;
        }
    }

    for (const tf of timeFrames) {
        const volumes = symbols[symbol].klines[tf].map(kline => parseFloat(kline[5]));
        symbols[symbol].prevVolume[tf] = Math.max(...volumes); // Highest volume of all klines in each TF
        monitorSymbol(symbol, tf);
    }
}

// Function to get klines for a symbol and timeframe from Binance Futures
async function getKlines(symbol, tf) {
    if (requestCount >= REQUEST_LIMIT) {
        console.log('Request limit reached, waiting for a minute...');
        await new Promise(resolve => setTimeout(resolve, TIME_FRAME));
        requestCount = 0; // Reset request count after waiting
    }

    requestCount++;
    const response = await axios.get(`https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${tf}&limit=200`);
    await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY)); // Delay between requests
    return response.data;
}

// The rest of your code remains the same...

// Example usage
(async () => {
    try {
        if (Object.keys(symbols).length == 0) {
            if (requestCount >= REQUEST_LIMIT) {
                console.log('Request limit reached, waiting for a minute...');
                await new Promise(resolve => setTimeout(resolve, TIME_FRAME));
                requestCount = 0; // Reset request count after waiting
            }

            requestCount++;
            const response = await axios.get('https://fapi.binance.com/fapi/v1/exchangeInfo');
            const symbolData = response.data.symbols;

            const usdtPairs = symbolData.filter(symbol => symbol.symbol.endsWith('USDT'));

            for (const pair of usdtPairs) {
                if (!symbols[pair.symbol]) {
                    await initializeSymbolData(pair.symbol);
                }
            }
        }

    } catch (error) {
        console.error('Error fetching futures pairs:', error.response.data.msg);
    }

    const timeFrames = ['1m', '5m', '15m', '30m', '1h'];
    setInterval(() => {
        for (const symbol in symbols) {
            timeFrames.forEach(tf => {
                const price = parseFloat(symbols[symbol].klines[tf][50][4]); // Latest closing price
                calculatePercentages(symbol, tf, price);
            });
        }
    }, 30000);
})();
