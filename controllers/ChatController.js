const express = require('express');
const Chat = require('../model/Chat');


const getChatHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Retrieve chat history for the current user
    const currentUserChatHistory = await getChatHistoryForCurrentUser(userId);

    // Retrieve chat history for the selected receiver
    const selectedReceiverChatHistory = await getChatHistoryForSelectedReceiver(userId);

    // Combine the chat histories of both users
    const combinedChatHistory = currentUserChatHistory.concat(selectedReceiverChatHistory);

    // Sort the combined chat history by createdAt
    combinedChatHistory.sort((a, b) => b.createdAt - a.createdAt);

    // Send the combined chat history
    res.json(combinedChatHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error,', error: error.message });
  }
};

const getChatHistoryForCurrentUser = async (userId) => {
  const chatHistoryForCurrentUser = await Chat.find({
    receiver: userId,
  }).sort({ createdAt: 1 }).exec();

  return chatHistoryForCurrentUser;
};

const getChatHistoryForSelectedReceiver = async (userId) => {
  const chatHistoryForSelectedReceiver = await Chat.find({
    sender: userId,
  }).sort({ createdAt: 1 }).exec();

  return chatHistoryForSelectedReceiver;
};

const send = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const sender = req.user.id;

    if (!sender || !message) {
      return res.status(400).json({ message: 'Receiver and message are required.' });
    }

    // Store the message for both users
    await Chat.create({
      sender,
      receiver,
      message,
    });

    res.status(201).json({ message: 'Message sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const receive = async (req, res) => {
  try {
    const { sender, message } = req.body;
    const receiver = req.user.id;

    if (!sender || !message) {
      return res.status(400).json({ message: 'Sender and message are required' });
    }

    // Store the message for both users
    await Chat.create({
      sender,
      receiver,
      message,
    });

    // Send the message to the receiver
    return res.status(201).json({ message: 'Message received' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getChatHistory, receive, send };
