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

// Store connected sockets with their corresponding user IDs
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    // Store the socket with the user ID
    connectedUsers[userId] = socket;
    console.log(`User ${userId} joined chat:`, socket.id);
  });

  socket.on('message', async (message) => {
    console.log(`Message received from ${message.sender} to ${message.receiver}:`, message);

    const newChat = new Chat({
      sender: message.sender,
      receiver: message.receiver,
      message: message.text,
      read: false,
    });

    await newChat.save();

    // Emit the message directly to the sender
    socket.emit('message', {
      _id: newChat._id,
      text: message.text,
      createdAt: newChat.createdAt,
      user: {
        _id: message.sender,
        name: 'Sender Name', // Replace with actual user name
        avatar: 'sender-avatar-url', // Replace with actual user avatar
      },
    });

    // Emit the message directly to the receiver if online
    const receiverSocket = connectedUsers[message.receiver];
    if (receiverSocket) {
      receiverSocket.emit('message', {
        _id: newChat._id,
        text: message.text,
        createdAt: newChat.createdAt,
        user: {
          _id: message.sender,
          name: 'Sender Name', // Replace with actual user name
          avatar: 'sender-avatar-url', // Replace with actual user avatar
        },
      });
    }
  });

  socket.on('disconnect', () => {
    // Remove the socket reference when a user disconnects
    const userId = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket);
    if (userId) {
      delete connectedUsers[userId];
      console.log(`User ${userId} disconnected:`, socket.id);
    }
  });
});

const port = process.env.PORT || 5050;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
