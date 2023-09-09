const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    action: {
        type: String,
        lowercase: true
    },
    body: {
        type: String
    },
    tweetRef: {
        type: Schema.Types.ObjectId,
        ref: 'Tweet'
    },
    origin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {timestamps: true,});

NotificationSchema.index({createdAt: 1}, {expireAfterSeconds: 604800});

module.exports = mongoose.model('Notification', NotificationSchema);