    const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');


const SettingSchema = new mongoose.Schema({
    
    sessionTimeoutMinutes: {
        type: Number,
        default: 15, 
        min: 1,
        required: true,
    },

    
    jwtExpirationHours: {
        type: Number,
        default: 8, 
        min: 1,
        required: true,
    },


    maxFailedLoginAttempts: {
        type: Number,
        default: 5,
        min: 1,
        required: true,
    },

 
    inactivityLockDays: {
        type: Number,
        default: 90, 
        min: 1,
        required: true,
    },
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});

module.exports = SettingModel = mongoose.model('system_settings', SettingSchema, 'system_settings');


