const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

const createToken = (username) => {
    return jwt.sign({username: username}, process.env.SECRET, {expiresIn: '3d'});
}

module.exports.signupUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.signup(username, email, password);

        //create token
        const token = createToken(user.username);

        res.status(200).json({username, image : user.image, displayName: user.displayName, token});
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports.loginUser = async (req, res) => {
    const { loginUsername, password } = req.body;

    try {
        const user = await User.login(loginUsername, password);
        const username = user.username;
        const token = createToken(user.username);
        res.status(200).json({username, image : user.image, displayName: user.displayName, token})
    } catch (error) {
        res.status(404).json({error: error.message});
    }
}

module.exports.followUser = async (req, res) => {
    const {followeeName} = req.params;

    const followee = await User.findOne({username: followeeName});

    if(!followee) {
        return res.status(404).json({error: 'User not found'});
    }

    const follower = await User.findById(req.user._id);

    if(followee.username === follower.username) {
        return res.status(400).json({error: 'Cannot follow yourself'})
    }

    if(followee.followers.includes(follower._id)) {
        return res.status(408).json({error: 'already following'})
    };

    followee.followers.push(follower)
    await followee.save()
    follower.following.push(followee)
    await follower.save()

    const notifCheck = await Notification.findOne({$and: [{origin: follower._id}, {receiver: followee._id}, {action : 'follow'}]});
    if(!notifCheck) {
        const notif = {
            'action': 'follow',
            'body': follower.username + ' followed you!',
            'origin': follower._id,
            'receiver': followee._id
        }
    
        await Notification.create(notif);
    }

    res.status(200).json({msg: follower.username + ' followed ' + followee.username})

}

module.exports.unfollowUser = async (req,res) => {
    const { unfollowedName } = req.params;
    const unfollowerId = req.user._id;

    const unfollowed = await User.findOne({username: unfollowedName});
    
    if(!unfollowed) {
        return res.status(404).json({error: 'User not found'});
    }

    const unfollower = await User.findById(unfollowerId);

    if(!unfollower) {
        return res.status(404).json({error: 'User not found'});
    }

    if(unfollowed.username == unfollower.username) {
        return res.status(400).json({error: 'Cannot unfollow yourself'});
    }

    const indexOfUnfollower = unfollowed.followers.indexOf(unfollower._id);
    const indexOfUnfollowedUser = unfollower.following.indexOf(unfollowed._id);

    if(indexOfUnfollower == -1 || indexOfUnfollowedUser == -1) {
        return res.status(404).json({error: 'Not following user'});
    }

    //splice corresponding arrays
    unfollowed.followers.splice(indexOfUnfollower, 1);
    await unfollowed.save();
    unfollower.following.splice(indexOfUnfollowedUser, 1);
    await unfollower.save();

    res.status(200).json({msg: unfollower.username + ' unfollowed ' + unfollowed.username});
}

module.exports.getProfileStats = async (req, res) => {
    const {profileName} = req.params;
    var isFollowing = false;

    const profile = await User.findOne({username: profileName}).select(['-email', '-password']).populate('followers', ['username', 'displayName', 'image']).populate('following', ['username', 'displayName', 'image']);

    if(!profile) {
        return res.status(404).json({error: 'User not found'});
    }

    profile.followers.map(f => {
        if(f.username === req.user.username) {
            isFollowing = true;
        }
    })

    res.status(200).json({profile, isFollowing});
}

module.exports.getFollowing = async (req, res) => {
    const currentUser = await User.findById(req.user._id).select(['-email', '-password', '-followers']).populate('following', ['displayName', 'username', 'image']);

    res.status(200).json(currentUser);
}

module.exports.whoToFollow = async (req, res) => {
    const currentUser = await User.findById(req.user._id);

    const list = await User.find({_id: {$nin: [req.user._id, ...currentUser.following]}}).limit(3).select(['-email', '-password', '-followers']).populate('username');

    res.status(200).json(list);
}

module.exports.getEditProfileInfo = async (req,res) => {
    const currentUser = await User.findById(req.user._id).select(['-password', '-following', '-followers']);

    if(!currentUser) {
        return res.status(404).json({error: 'User not found.'});
    }

    res.status(200).json(currentUser);
}

module.exports.editProfile = async (req, res) => {
    const {displayName, image} = req.body;
    const id = req.user._id;

    const user = await User.findByIdAndUpdate(id, {displayName, image}).select(['-email', '-password', '-following', '-followers']);

    res.status(200).json({success: 'User Info has been updated. (Re-Login for some Changes to take effect)'});

}