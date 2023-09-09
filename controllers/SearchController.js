const Tweet = require('../models/Tweet');
const User = require('../models/User');

module.exports.searchData = async (req, res) => {
    const { filter } = req.query;

    const userResults = await User.find({username: {'$regex': `^${filter}` , $options: "i"}}).limit(5).select(['-email', '-password', '-followers', '-following']);
    
    res.status(200).json(userResults);
}