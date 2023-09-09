const express = require('express');
const router = express.Router();
const chat = require('../controllers/ChatController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/', chat.getChats);

module.exports = router;

