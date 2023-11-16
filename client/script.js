const socket = new WebSocket("ws://localhost:3000");

let username = '';
let chatroom = '';

socket.addEventListener("open", () => {
  console.log("WebSocket connected!");
});

socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log("Received data:", data); 

    if (data.action === "message") {
      displayMessage(`${data.username}: ${data.message}`);
    } else if (data.action === "participants" && data.chatroom === chatroom) {
      console.log("Updating participants list:", data.participants); 
      updateParticipantsList(data.participants);
    }
  } catch (error) {
    console.error("Error parsing message:", error);
    displayMessage(event.data); 
  }
});

socket.addEventListener("close", () => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

function setUsername() {
  username = document.getElementById('username').value;
  if (username) {
    console.log('Username set to: ' + username);
    sendMessageToServer("join", username);
  } else {
    alert("Please enter a username.");
  }
}

function joinChatroom() {
  chatroom = document.getElementById('chatroom').value;
  if (chatroom) {
    document.getElementById('chat-window').style.display = 'block';
    sendMessageToServer("join", chatroom);
    console.log('Joined chatroom: ' + chatroom);
  } else {
    alert("Please enter a chatroom name.");
  }
}

function sendMessage() {
  const message = document.getElementById('message').value;
  if (message) {
    sendMessageToServer("message", chatroom, message);
    document.getElementById('message').value = '';
  }
}

function sendMessageToServer(action, chatroom, message = '') {
  const messageData = { action: action, username: username, chatroom: chatroom, message: message };
  socket.send(JSON.stringify(messageData));
}

function displayMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  const newMessage = document.createElement('div');
  newMessage.classList.add('message');
  newMessage.textContent = message;
  chatMessages.appendChild(newMessage);
}

function updateParticipantsList(participants) {
  const participantsListElement = document.getElementById('participants-list');
  participantsListElement.innerHTML = '';

  participants.forEach(participant => {
    const li = document.createElement('li');
    li.textContent = participant;
    participantsListElement.appendChild(li);
  });
}
