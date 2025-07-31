const socket = io();
let yourId = null;
let connectedUser = null;

const yourIdSpan = document.getElementById('yourId');
const targetIdInput = document.getElementById('targetId');
const connectBtn = document.getElementById('connectBtn');
const statusDiv = document.getElementById('status');
const chatArea = document.getElementById('chatArea');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

socket.on('yourId', (id) => {
  yourId = id;
  yourIdSpan.textContent = id;
});

connectBtn.addEventListener('click', () => {
  socket.emit('connectToUser', targetIdInput.value);
  statusDiv.textContent = 'Trying to connect...';
});

socket.on('connectionRequest', ({ from }) => {
  if (confirm('User ' + from + ' wants to connect. Accept?')) {
    socket.emit('acceptConnection', from);
    connectedUser = from;
    chatArea.style.display = 'block';
    statusDiv.textContent = 'Connected to ' + from;
  }
});

socket.on('connectionAccepted', (id) => {
  connectedUser = id;
  chatArea.style.display = 'block';
  statusDiv.textContent = 'Connected to ' + id;
});

socket.on('userNotFound', (id) => {
  statusDiv.textContent = 'User ' + id + ' not found.';
});

sendBtn.addEventListener('click', () => {
  if (connectedUser && messageInput.value.trim() !== '') {
    const msg = messageInput.value.slice(0, 50);
    socket.emit('sendMessage', { toId: connectedUser, message: msg });
    chatBox.innerHTML += '<div><b>You:</b> ' + msg + '</div>';
    messageInput.value = '';
  }
});

socket.on('receiveMessage', ({ from, message }) => {
  chatBox.innerHTML += '<div><b>' + from + ':</b> ' + message + '</div>';
});
