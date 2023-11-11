const WebSocket = require("ws");
const clients = new Set();
const chatrooms = new Map();

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });

  websocketServer.on("connection", (ws) => {
    clients.add(ws);
    console.log("New websocket connection");

    ws.on("message", (message) => {
      handleMessage(ws, message);
    });

    ws.on("close", () => {
      if (ws.chatroom && chatrooms.has(ws.chatroom)) {
        const room = chatrooms.get(ws.chatroom);
        room.delete(ws);
        if (room.size === 0) {
          chatrooms.delete(ws.chatroom);
        }
        broadcastRoomParticipants(ws.chatroom);
      }
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
        if (!chatrooms.has(ws.chatroom)) {
          chatrooms.set(ws.chatroom, new Set());
        }
        chatrooms.get(ws.chatroom).add(ws);
        broadcastRoomParticipants(ws.chatroom);
        break;
      case "message":
        broadcastMessage(data.chatroom, `${data.username}: ${data.message}`);
        break;
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
};

const broadcastMessage = (chatroom, message) => {
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN && client.chatroom === chatroom) {
      client.send(message);
    }
  }
};

const broadcastRoomParticipants = (chatroom) => {
  const participants = Array.from(chatrooms.get(chatroom) || []).map(client => client.username);
  console.log(`Broadcasting participants in ${chatroom}:`, participants); 
  const message = JSON.stringify({ action: "participants", chatroom: chatroom, participants: participants });
  chatrooms.get(chatroom).forEach(client => {
    client.send(message);
  });
};

module.exports = { initializeWebsocketServer };
