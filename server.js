const WebSocket = require('ws');
const axios = require('axios');
const os = require('os');
const network = require('network');
const port = 8080;

const server = new WebSocket.Server({ port });

server.on('connection', (ws) => {
    console.log('Client connected');

    const sendTickerData = async () => {
        try {
            const response = await axios.get('https://api.bitso.com/v3/ticker/');
            ws.send(JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching data from Bitso API:', error);
        }
    };

    const intervalId = setInterval(sendTickerData, 1300);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

network.get_active_interface((err, iface) => {
    if (err) {
        console.error('Error getting network interface:', err);
    } else {
        const ipAddress = iface.ip_address;
        console.log(`WebSocket server is running on ws://${ipAddress}:${port}`);
    }
});
