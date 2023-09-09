const express = require('express');
const router = express.Router();
const comments = require('../controllers/CommentController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.post('/:tweetId', comments.createComment);
router.delete('/:tweetId/:commentId', comments.deleteComment);

module.exports = router;