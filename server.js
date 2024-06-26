const WebSocket = require('ws');
const axios = require('axios');

const server = new WebSocket.Server({ port: 8765 });

server.on('connection', (ws) => {
    console.log('Client connected');

    const sendTickerData = async () => {
        try {
            const response = await axios.get('https://api.bitso.com/v3/ticker/');
            console.log(response)
            ws.send(JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching data from Bitso API:', error);
        }
    };

    const intervalId = setInterval(sendTickerData, 1000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

console.log('WebSocket server is running on ws://localhost:8765');
