const WebSocket = require('ws');

const initializeAPI = (app) => {
  app.get("/api/hello", hello);

  // WebSocket server setup
  const server = new WebSocket.Server({ noServer: true });

  server.on('connection', socket => {
    socket.on('message', message => {
      console.log('Received:', message);
    });

    socket.send('Connection established');
  });

  app.on('upgrade', (request, socket, head) => {
    server.handleUpgrade(request, socket, head, newSocket => {
      server.emit('connection', newSocket, request);
    });
  });
};

const hello = (req, res) => {
  res.send("Hello World!");
};

module.exports = { initializeAPI };
