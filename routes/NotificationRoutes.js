const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const notifications = require('../controllers/NotificationController');

router.use(requireAuth);


router.post('/', notifications.testCreate);
router.get('/unread', notifications.getNotifsUnreadCount);
router.get('/read', notifications.getNotifsRead);

module.exports = router;