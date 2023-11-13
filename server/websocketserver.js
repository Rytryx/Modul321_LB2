const WebSocket = require("ws");
const clients = new Set();
const chatrooms = new Map();
const usersInChatrooms = new Map();

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });

  websocketServer.on("connection", (ws) => {
    clients.add(ws);
    console.log("New websocket connection");

    ws.on("message", (message) => {
      handleMessage(ws, message);
    });

    ws.on("close", () => {
      console.log("Connection closed. Username: ", ws.username, " Room: ", ws.chatroom);
      if (ws.chatroom && chatrooms.has(ws.chatroom)) {
        const room = chatrooms.get(ws.chatroom);
        room.delete(ws);

        if (usersInChatrooms.has(ws.chatroom)) {
          const users = usersInChatrooms.get(ws.chatroom);
          users.delete(ws.username);
          console.log("Updated users in room after disconnection: ", Array.from(users));
          broadcastRoomParticipants(ws.chatroom);
        }

        if (room.size === 0) {
          chatrooms.delete(ws.chatroom);
        }
      }
      clients.delete(ws);
    });
  });
};

const handleMessage = (ws, message) => {
  try {
    const data = JSON.parse(message);
    console.log("Received message: ", data);
    switch(data.action) {
      case "join":
        ws.username = data.username;
        ws.chatroom = data.chatroom;

        if (!chatrooms.has(ws.chatroom)) {
          chatrooms.set(ws.chatroom, new Set());
        }
        chatrooms.get(ws.chatroom).add(ws);

        if (!usersInChatrooms.has(ws.chatroom)) {
          usersInChatrooms.set(ws.chatroom, new Set());
        }
        usersInChatrooms.get(ws.chatroom).add(ws.username);
        console.log("User joined room: ", ws.username, " Room: ", ws.chatroom);

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
  console.log("Broadcasting message to room: ", chatroom, " Message: ", message);
  for (let client of clients) {
    if (client.readyState === WebSocket.OPEN && client.chatroom === chatroom) {
      client.send(message);
    }
  }
};

const broadcastRoomParticipants = (chatroom) => {
  const participants = Array.from(usersInChatrooms.get(chatroom) || []);
  const message = JSON.stringify({ action: "participants", chatroom: chatroom, participants: participants });
  console.log("Broadcasting participants to room: ", chatroom, " Participants: ", participants);
  chatrooms.get(chatroom).forEach(client => {
    client.send(message);
  });
};

module.exports = { initializeWebsocketServer };
