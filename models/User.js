const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const validator = require('validator');

const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://jfly-ecommerce.s3.ap-southeast-2.amazonaws.com/default-avatar-blue.png"
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
})

// Static Signup method
UserSchema.statics.signup = async function(username, email, password) {
    //form validation
    if(!username || !email || !password) {
        throw Error ('All fields must be filled.');
    }

    if(username.length > 12) {
        throw Error ('Username must be within 12 characters.');
    }

    let specialChars =/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    if(specialChars.test(username)) {
        throw Error('Username must not contain special characters.');
    }

    //validator
    if(!validator.isEmail(email)) {
        throw Error('Invalid email address.');
    }

    //password validator
    if(!validator.isStrongPassword(password)) {
        throw Error('Password is not strong enough.');
    }

    const emailExists = await this.findOne({email : email.toLowerCase()});
    
    if(emailExists) {
        throw Error('Email is already in use.');
    }

    const usernameExists = await this.findOne({username : {'$regex': `^${username}$`, '$options' : 'i'}})

    if(usernameExists) {
        throw Error('Username is already in use.');
    }
    

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = this.create({username, email, password: hash, displayName : username});

    return user;
}

//Static Login Method
UserSchema.statics.login = async function(loginUsername, password) {
    //form validator
    if(!loginUsername || !password) {
        throw Error('All fields must be filled.');
    }

    const user = await this.findOne({$or: [
        {username : {'$regex': `^${loginUsername}$`, '$options' : 'i'}}, 
        {email : loginUsername.toLowerCase()}]});

    if(!user) {
        throw Error('Incorrect username');
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        throw Error('Incorrect password.');
    }

    return user;
}

module.exports = mongoose.model('User', UserSchema);
