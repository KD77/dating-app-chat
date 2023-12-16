// app.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const ChatRoutes = require('./routers/ChatRoutes');
const Chat = require('./model/Chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(express.json());

app.use('/api/user/chat', ChatRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (senderId, receiverId) => {
    const roomId = generateRoomId(senderId, receiverId);
    socket.join(roomId);
    console.log(`User joined chat between ${senderId} and ${receiverId} (Room ID: ${roomId}):`, socket.id);
  });

  socket.on('message', (message) => {
    console.log(`Message received in chat between ${message.sender} and ${message.receiver}:`, message);

    const newChat = new Chat({
      sender: message.sender,
      receiver: message.receiver,
      message: message.text,
      read: false,
    });

    newChat.save();

    io.to(generateRoomId(message.sender, message.receiver)).emit('message', {
      _id: newChat._id,
      text: message.text,
      createdAt: newChat.createdAt,
      user: {
        _id: message.sender,
        name: 'Sender Name', // Replace with actual user name
        avatar: 'sender-avatar-url', // Replace with actual user avatar
      },
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

function generateRoomId(userId1, userId2) {
  // You can create a unique ID based on the two user IDs
  return `${userId1}_${userId2}`;
}

const port = process.env.PORT || 5050;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
