const express = require('express');
const router = express.Router();
const tweet = require('../controllers/TweetController');
const requireAuth = require('../middleware/requireAuth');

router.use(requireAuth);

router.get('/following', tweet.getFollowingTweets);
router.get('/', tweet.getAllTweets);
router.get('/:id', tweet.getSingleTweet);
router.get('/author/:author', tweet.getTweetsByAuthor);
router.post('/', tweet.createTweet);
router.delete('/:id', tweet.deleteTweet);
router.patch('/:id', tweet.editTweet);

router.post('/like/:id', tweet.likeTweet);
router.post('/unlike/:id', tweet.unlikeTweet);

module.exports = router;
