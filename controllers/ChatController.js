const express = require('express');
const Chat = require('../model/Chat');

exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    // Query the database to get chat history for the specified user ID
    const chatHistory = await Chat.find({ receiver: userId }).sort({ createdAt: 1 }).exec();
    res.json(chatHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.send = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const sender = req.user.id;

    if (!receiver || !message) {
      return res.status(400).json({ message: 'Receiver and message are required.' });
    }

    const newChat = new Chat({ sender, receiver, message });
    const savedChat = await newChat.save();

    res.status(201).json({ message: 'Message sent', data: savedChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.receive = async (req, res) => {
  try {
    const { sender, message } = req.body;
    const receiver = req.user.id;

    if (!sender || !message) {
      return res.status(400).json({ message: 'Sender and message are required.' });
    }

    const newChat = new Chat({ sender, receiver, message });
    const savedChat = await newChat.save();

    res.status(201).json({ message: 'Message received', data: savedChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
