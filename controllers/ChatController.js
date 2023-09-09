const Chat = require('../models/Chat');

module.exports.getChats = async (req,res) => {
    const chats = await Chat.find({participants : {$in: [req.user._id]}})
        .populate('participants', ['username', 'displayName', 'image'])
        .populate('latestMessage');

    if(!chats) {
        return res.status(404).json({error: 'chats not found'});
    }

    res.status(200).json(chats);
}