const express = require('express');
const router = express.Router();
const user = require('../controllers/UserController');
const requireAuth = require('../middleware/requireAuth');

router.post('/signup', user.signupUser);
router.post('/login', user.loginUser);
router.post('/follow/:followeeName', requireAuth, user.followUser);
router.post('/unfollow/:unfollowedName', requireAuth, user.unfollowUser);
router.get('/stats/:profileName', requireAuth, user.getProfileStats);
router.get('/following', requireAuth, user.getFollowing);
router.get('/suggested', requireAuth, user.whoToFollow);
router.get('/editinfo', requireAuth, user.getEditProfileInfo);
router.patch('/update', requireAuth, user.editProfile);

module.exports = router;