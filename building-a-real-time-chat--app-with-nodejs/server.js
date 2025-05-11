const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/receiver', (req, res) => res.sendFile(__dirname + '/public/receiver.html'));

const users = {};

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('user-connected', username => {
    users[socket.id] = username;
    socket.broadcast.emit('user-status', { user: username, status: 'online' });
  });

  socket.on('chat message', (msgData) => {
    msgData.seen = false;
    io.emit('chat message', { ...msgData });
  });

  socket.on('message seen', (msgData) => {
    io.emit('message seen', msgData); // Tell everyone that message was seen
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    socket.broadcast.emit('user-status', { user, status: 'offline' });
    delete users[socket.id];
    console.log('User disconnected');
  });
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
