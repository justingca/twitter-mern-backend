const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Tweet = require('../models/Tweet');

module.exports.createComment = async(req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if(content.length > 140) {
        return res.status(400).json({error: 'Comment exceeds character limit'})
    }

    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet) {
        return res.status(404).json({error: 'Tweet not found'});
    }

    const comment = await Comment.create({content, author : req.user._id});
    tweet.comments.push(comment);
    await tweet.save();

    if(tweet.author.toString() !== req.user._id.toString()) {
        const notifReceiver = await User.findOne({_id : tweet.author});

        const notifCheck = await Notification.findOne({$and: [{origin: req.user._id}, {receiver: notifReceiver._id}, {tweetRef: tweet._id}, {action : 'comment'}]});
        
        if(!notifCheck) {
            const notif = {
                'action': 'comment',
                'body':  req.user.username + ' commented on your tweet!',
                'tweetRef': tweet._id,
                'origin': req.user._id,
                'receiver': notifReceiver._id
            }
        
            await Notification.create(notif);
        }
    }
    
    await comment.populate('author', ['username', 'displayName', 'image']);
    res.status(200).json(comment);
}

module.exports.deleteComment = async (req, res) => {
    const {tweetId, commentId} = req.params;
    const tweet = await Tweet.findByIdAndUpdate(tweetId, {$pull: {comments : commentId}});
    const comment = await Comment.findByIdAndDelete(commentId);

    if(!comment) {
        return res.status(404).json({error: 'comment not found'});
    }

    res.status(200).json(tweet);
}