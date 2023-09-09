const Tweet = require('../models/Tweet');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');


//get all tweets
module.exports.getAllTweets = async (req,res) => {
    const {page = 1} = req.query
    const pageLimit = 20;
    const skip = (page - 1) * pageLimit;

    const total = await Tweet.find({}).sort({createdAt: -1}).limit(1000).count();
    const tweets = await Tweet.find({}).sort({createdAt: -1}).limit(1000).limit(pageLimit).skip(skip).populate('author', ['username', 'displayName', 'image']);

    res.status(200).json({tweets, totalPages: Math.ceil(total/pageLimit), currentPage : page});
}

//get single tweet
module.exports.getSingleTweet = async (req, res) => {
    const { id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    const tweet = await Tweet.findById(id).populate({
        path: 'comments',
        populate: {
            path: 'author',
            select: (['-password', '-email', '-followers', '-following'])
        },
        options: {
            sort: {createdAt : -1}
        }
    }).populate('author', ['username', 'image', 'displayName']);

    if(!tweet) {
        return res.status(404).json({error: 'Tweet not found'});
    }


    res.status(200).json(tweet);
}

//get all tweets by an author
module.exports.getTweetsByAuthor = async (req, res) => {
    const {author} = req.params;
    const { page = 1} = req.query;
    const pageLimit = 20;
    const skip = (page - 1) * pageLimit;
    const user = await User.findOne({username : author});

    if(!user) {
        return res.status(404).json({error: 'User does not exist'});
    }
    

    const tweets = await Tweet.find({author: user._id}).limit(pageLimit).skip(skip).sort({createdAt: -1}).populate('author', ['username', 'displayName', 'image']);

    if(!tweets) {
        return res.status(404).json({error: 'Tweets not found'});
    }

    const total = await Tweet.find({author: user._id}).count();

    res.status(200).json({tweets, totalPages: Math.ceil(total/pageLimit), currentPage: page});

}

//create tweet
module.exports.createTweet = async(req,res) => {
    const { content, image } = req.body;
    const author = req.user._id;
    
    try {
        const tweet = await Tweet.create({content, image, author});
        await tweet.populate('author', ['username', 'displayName', 'image']);
        res.status(200).json(tweet);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

//delete tweet
module.exports.deleteTweet = async (req, res) => {
    const {id} = req.params;
    const {userId} = req.user._id

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    const tweet = await Tweet.findByIdAndDelete(id);

    if(!tweet) {
        return res.status(400).json({error: 'Tweet not found'});
    }

    if(tweet.author.toString() !== req.user._id.toString()) {
        return res.status(400).json({error: 'You do not have permission to delete.'})
    }


    res.status(200).json(tweet);
}

//edit tweet
module.exports.editTweet = async (req, res) => {
    const { id } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    const tweet = await Tweet.findByIdAndUpdate(id, {...req.body});

    if(!tweet) {
        return res.status(400).json({error: 'Tweet not found'});
    }

    res.status(200).json(tweet);

}

module.exports.getFollowingTweets = async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const {page = 1} = req.query;
    const pageLimit = 20;
    const skip = (page - 1) * pageLimit; 
    var followerList = [];


    const total = await Tweet.find({author: {$in: [req.user._id, ...currentUser.following]}}).sort({createdAt: -1}).limit(1000).count();
    const tweets = await Tweet.find({author : {$in: [req.user._id, ...currentUser.following]}}).sort({createdAt: -1}).limit(1000).limit(pageLimit).skip(skip).populate('author', ['username', 'image', 'displayName']);
    

    res.status(200).json({tweets, totalPages: Math.ceil(total/pageLimit), currentPage: page});
}

module.exports.likeTweet = async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id);

    if(!tweet) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    if(tweet.likes.includes(req.user.username)) {
        return res.status(404).json({error: 'Already liked tweet'});
    }

    tweet.likes.push(req.user.username);
    await tweet.save();

    if(tweet.author.toString() !== req.user._id.toString()) {
        const notifReceiver = await User.findOne({_id : tweet.author});

        const notifCheck = await Notification.findOne({$and: [{origin: req.user._id}, {receiver: notifReceiver._id}, {tweetRef: tweet._id}, {action : 'like'}]});
        
        if(!notifCheck) {
            const notif = {
                'action': 'like',
                'body':  req.user.username + ' liked your tweet!',
                'tweetRef': tweet._id,
                'origin': req.user._id,
                'receiver': notifReceiver._id
            }
        
            await Notification.create(notif);
        }
    }

    await tweet.populate('author', ['username', 'displayName', 'image']);

    res.status(200).json(tweet);
}

module.exports.unlikeTweet = async (req, res) => {
    const {id} = req.params;
    const tweet = await Tweet.findById(id);

    if(!tweet) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    if(!tweet.likes.includes(req.user.username)) {
        return res.status(404).json({error: 'Tweet not liked'});
    }

    const index = tweet.likes.indexOf(req.user.username);
    tweet.likes.splice(index, 1);
    await tweet.save();

    await tweet.populate('author', ['username', 'displayName', 'image']);

    res.status(200).json(tweet);
}