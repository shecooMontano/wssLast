const WebSocket = require('ws');
const socket = new WebSocket('ws://10.128.0.2:8765');

socket.onmessage = function(event) {
    console.log('Data received from server:', event.data);
};

socket.onopen = function(event) {
    console.log('Connection established');
};

socket.onclose = function(event) {
    console.log('Connection closed');
};

socket.onerror = function(error) {
    console.log('Error:', error);
};
