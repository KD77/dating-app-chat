const express = require('express');
const router = express.Router();
const {send, receive, getChatHistory}= require('../controllers/ChatController');
const auth = require('./auth');

// Retrieve chat messages for a specific user
router.get('/history/:userId', auth, getChatHistory);
router.get('/receive',auth, receive)
router.post('/send',auth, send)

module.exports = router;
