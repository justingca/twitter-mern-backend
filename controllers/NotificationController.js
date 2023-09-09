const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports.testCreate = async (req, res) => {
    const fucker = await User.findOne({username: 'fucker'});

    const notification = {
        'action': 'follow',
        'body': fucker.username + ' followed you',
        'origin':  fucker._id,
        'receiver': req.user._id,
    }

    await Notification.create(notification);

    res.status(200).json(notification);
}

module.exports.getNotifsRead = async (req, res) => {
    const notifications = await Notification.find({receiver : req.user._id}).sort({createdAt : -1}).populate('origin', 'image');

    if(!notifications) {
        return res.status(400).json({error: 'No notifications found'})
    }

    notifications.forEach(async (notif) => {
        notif.seen = true;
        await notif.save();
    })

    res.status(200).json(notifications);
}

module.exports.getNotifsUnreadCount = async (req, res) => {
    const notifCount = await Notification.find({$and: [{receiver : req.user._id}, {seen :false}]}).count();

    if(!notifCount) {
        return res.status(200).json({count: 0});
    }

    res.status(200).json({count : notifCount});
}