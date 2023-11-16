const WebSocket = require('ws');
const { executeSQL } = require('./database');

const initializeAPI = (app) => {
  app.get("/api/hello", hello);

  // WebSocket server setup
  const server = new WebSocket.Server({ noServer: true });

  server.on('connection', socket => {
    socket.on('message', async (message) => {
      console.log('Received:', message.toString());
      
      try {
        const data = JSON.parse(message);
        if (data.action === 'message') {
          const query = `INSERT INTO messages (user_id, message, chatroom) VALUES ((SELECT id FROM users WHERE name = ?), ?, ?)`;
          await executeSQL(query, [data.username, data.message, data.chatroom]);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
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
