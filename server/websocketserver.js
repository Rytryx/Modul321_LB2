const WebSocket = require("ws");
const clients = new Set();

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });

  websocketServer.on("connection", (ws) => {
    clients.add(ws);
    console.log("New websocket connection");

    ws.on("message", (message) => {
      console.log("Message received: " + message);
      handleMessage(ws, message);
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Websocket connection closed");
    });
  });
};

const handleMessage = (ws, message) => {
  try {
    const data = JSON.parse(message);

    switch(data.action) {
      case "join":
        ws.username = data.username;
        ws.chatroom = data.chatroom;
        break;
      case "message":
        broadcastMessage(data.chatroom, `${data.username}: ${data.message}`);
        break;
      default:
        console.log("Unknown action");
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};

const broadcastMessage = (chatroom, message) => {
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN && client.chatroom === chatroom) {
      client.send(message);
    }
  }
};

module.exports = { initializeWebsocketServer };
