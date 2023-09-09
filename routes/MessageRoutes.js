const express = require('express');
const router = express.Router();
const message = require('../controllers/MessageController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/:receiverUser', message.sendMessage);
router.get('/:receiverUser', message.getMessages);

module.exports = router;