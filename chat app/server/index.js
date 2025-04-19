const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let clients = [];

wss.on('connection', function connection(ws) {
  clients.push(ws);
  console.log('New client connected');

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    // Clean up clients list
    clients = clients.filter(client => client.readyState === WebSocket.OPEN);
    // Broadcast to all clients including sender
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
