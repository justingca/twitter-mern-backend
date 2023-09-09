const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const Notification = require('../models/Notification');

module.exports.sendMessage = async (req, res) => {
    const {receiverUser} = req.params;
    const {content} = req.body;
    const receiver = await User.findOne({username : receiverUser});

    if (!receiver) {
        return res.status(404).json({error: 'User not found'});
    }

    //check if chat exists
    const chatExists = await Chat.findOne({$or: [
        {participants: {$eq: [req.user._id, receiver._id]}},
        {participants: {$eq: [receiver._id, req.user._id]}}
    ]});

    //CHAT DOESNT EXIST ROUTE
    //if chat doesn't exist create new chat
    if(!chatExists) {
        const chat = await Chat.create({participants: [req.user._id, receiver._id]});
        const message = await Message.create({
            content,
            sender: req.user._id,
            chat: chat._id
        })
        await message.populate('sender', 'username');

        chat.latestMessage = message._id;
        await chat.save();

        //notification to receiver
        if(message.sender !== req.user.username) {

            const notifCheck = await Notification.findOne({$and: [{origin: req.user._id}, {receiver: receiver._id}, {action : 'message'}]});
            
            if(!notifCheck) {
                const notif = {
                    'action': 'message',
                    'body':  req.user.username + ' sent you a message!',
                    'origin': req.user._id,
                    'receiver': receiver._id
                }
            
                await Notification.create(notif);
            }
        }

        return res.status(200).json(message);
    }
    
    //CHAT EXISTS ROUTE//
    // create message
    const message = await Message.create({
        content,
        sender: req.user._id,
        chat: chatExists._id
    });
    await message.populate('sender', 'username');

    //set chat latest message
    chatExists.latestMessage = message._id;
    await chatExists.save();

    //notification to receiver
    if(message.sender !== req.user.username) {

        const notifCheck = await Notification.findOne({$and: [{origin: req.user._id}, {receiver: receiver._id}, {action : 'message'}]});
        
        if(!notifCheck) {
            const notif = {
                'action': 'message',
                'body':  req.user.username + ' sent you a message!',
                'origin': req.user._id,
                'receiver': receiver._id
            }
        
            await Notification.create(notif);
        }
    }

    res.status(200).json(message);
}


module.exports.getMessages = async (req, res) => {
    const {receiverUser} = req.params;

    const receiver = await User.findOne({username : receiverUser}).select(['username', 'displayName', 'image']);

    if(!receiver) {
        return res.status(404).json({error: 'User not found.'});
    }

    const chat = await Chat.findOne({$or: [
        {participants: {$eq: [req.user._id, receiver._id]}},
        {participants: {$eq: [receiver._id, req.user._id]}}
    ]});
    
    if(chat) {
        if(!chat.participants.includes(req.user._id)) {
            return res.status(404).json({error: 'You do not have permission to view this chat'});
        }
        const messages = await Message.find({chat : chat._id}).populate('sender', 'username');

        return res.status(200).json({receiver, messages});
    }


    res.status(200).json({receiver, messages: []});
}