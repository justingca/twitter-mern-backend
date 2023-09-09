require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const port = process.env.PORT;
const cors = require('cors');

const tweetRoutes = require('./routes/TweetRoutes');
const userRoutes = require('./routes/UserRoutes');
const notificationRoutes = require('./routes/NotificationRoutes');
const commentRoutes = require('./routes/CommentRoutes');
const imageUploadRoutes = require('./routes/ImageRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const messageRoutes = require('./routes/MessageRoutes');
const searchRoutes = require('./routes/SearchRoutes');

//middleware functions
app.use(cors({
    origin: 'http://localhost:3000',
    method: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
})

//tweet routes
app.use('/tweets', tweetRoutes);
//comment routes
app.use('/tweets/comments/', commentRoutes);
//user router
app.use('/users', userRoutes);
//notification routes
app.use('/notifications', notificationRoutes);
//image upload
app.use('/images', imageUploadRoutes);
//chat routes
app.use('/chats', chatRoutes);
//message routes
app.use('/message', messageRoutes);
//search routes
app.use('/search', searchRoutes);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(port, () => {
            console.log('Connected to DB and listening on port ' + port);
        })
    })
    .catch((error) => {
        console.log(error);
    }); 