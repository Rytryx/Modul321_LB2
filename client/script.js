const socket = new WebSocket("ws://localhost:3000");

let username = '';
let chatroom = '';

socket.addEventListener("open", () => {
  console.log("WebSocket connected!");
});

socket.addEventListener("message", (event) => {
  try {
    const data = JSON.parse(event.data);

    if (data.error) {
      alert(data.error);
      document.getElementById('username').value = '';
      document.getElementById('chatroom').value = '';
      return;
    }

    if (data.action === "previousMessages") {
      displayMessage(data.content);
    } else if (data.action === "joinSuccess") {
      document.getElementById('chat-window').style.display = 'block';
      console.log('Successfully joined chatroom: ' + chatroom);
    } else if (data.action === "message") {
      displayMessage(`${data.username}: ${data.message}`);
    } else if (data.action === "participants" && data.chatroom === chatroom) {
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
  if (!username) {
    alert("Please enter a username.");
  }
}

function joinChatroom() {
  username = document.getElementById('username').value;
  chatroom = document.getElementById('chatroom').value;

  if (username && chatroom) {
    sendMessageToServer("join", chatroom);
    console.log('Attempting to join chatroom: ' + chatroom);
  } else {
    alert("Please enter a username and chatroom name.");
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
  chatMessages.innerHTML = '';

  const messageLines = message.split('\n');

  messageLines.forEach(line => {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message');
    newMessage.textContent = line;
    chatMessages.appendChild(newMessage);
  });
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
