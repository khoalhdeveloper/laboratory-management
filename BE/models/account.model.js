const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const typerole = require('../constants/typerole');
const AccountSchema = new mongoose.Schema(
    {
    userid: { type: String, required: true, unique: true },

    image: { type: String, required: false },

    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: { type: String, required: false },
    fullName: { type: String, required: true },
    identifyNumber: { type: String, required: false },
    age: { type: Number, required: false },
    gender: { type: String, enum: ['male', 'female', 'other'], required: false },
    address: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    role: { type: String, enum: Object.values(typerole), default: typerole.USER },
    isActive: {
        type: Boolean,
        default: false 
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    lastLogin: { type: Date, default: Date.now }
},
{
    timestamps: true,
    versionKey: false,
},

);
module.exports = mongoose.model('Account', AccountSchema, 'accounts');




