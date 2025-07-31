const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = 3000;

app.use(express.static(__dirname));

let users = {};

io.on('connection', (socket) => {
  const userId = Math.floor(Math.random() * 100000);
  users[socket.id] = userId;
  socket.emit('yourId', userId);

  socket.on('connectToUser', (targetId) => {
    let targetSocket = Object.keys(users).find(id => users[id] == targetId);
    if (targetSocket) {
      io.to(targetSocket).emit('connectionRequest', { from: users[socket.id] });
    } else {
      socket.emit('userNotFound', targetId);
    }
  });

  socket.on('acceptConnection', (fromId) => {
    let fromSocket = Object.keys(users).find(id => users[id] == fromId);
    if (fromSocket) {
      io.to(fromSocket).emit('connectionAccepted', users[socket.id]);
      socket.emit('connectionAccepted', fromId);
    }
  });

  socket.on('sendMessage', ({ toId, message }) => {
    let targetSocket = Object.keys(users).find(id => users[id] == toId);
    if (targetSocket) {
      io.to(targetSocket).emit('receiveMessage', { from: users[socket.id], message });
    }
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

http.listen(PORT, () => console.log(`? Server running on http://localhost:${PORT}`));
