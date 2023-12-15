const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Import http module
const socketIo = require('socket.io'); // Import socket.io

const ChatRoutes = require('./routers/ChatRoutes');
const Chat = require('./model/Chat'); // Import the Message model

const app = express();
const server = http.createServer(app); // Create an HTTP server
const io = socketIo(server); // Attach Socket.io to the HTTP server

require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(express.json());

// Routes
app.use('/api/user/chat', ChatRoutes);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room ${roomId}:`, socket.id);
  });

  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room ${roomId}:`, socket.id);
  });

  socket.on('message', (message) => {
    console.log(`Message received in room ${message.roomId}:`, message);

    // Save message to database
    const newChat = new Chat({
      sender: message.sender,
      receiver: message.receiver,
      message: message.message,
      read: false,
    });

    newChat.save();

    // Emit message to room
    io.to(message.roomId).emit('message', newChat);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server (use server instead of app to integrate with Socket.io)
const port = process.env.PORT || 5050;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
