const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Comment = require('./Comment');

const TweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 140
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    image: {
        type: String
    },
    likes: [{
        type: String
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {timestamps: true})

TweetSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Comment.deleteMany({_id: {$in: doc.comments}})
    }
})

module.exports = mongoose.model('Tweet', TweetSchema);