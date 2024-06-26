const WebSocket = require('ws');
const socket = new WebSocket('ws://34.68.206.197:8080');

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
