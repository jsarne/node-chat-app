const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '..', 'public');

const app = express();
// explicitly create server (outside express lib) so we can access it for socket.io
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('join', (options, callback) => {
    const {error, user} = addUser({id: socket.id, ...options});
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('message', generateMessage('Welcome!', user));
    socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined the room!`, user));
    io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
    callback();
  });

  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback('no naughtiness plz!');
    } else {
      const user = getUser(socket.id);
      if (user) {
        io.to(user.room).emit('message', generateMessage(msg, user));
        callback('received ' + msg);  
      }
    }
  });

  socket.on('sendLocation', (loc, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${loc.lat},${loc.long}`, user));
      callback('loc received');
    }
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('message', generateMessage(`${user.username} has left the room.`, user));
      io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
    }
  });
});

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});
