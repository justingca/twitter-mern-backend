const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', CommentSchema);