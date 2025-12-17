const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const roleSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    role_description: {
        type: String,
        required: true,
        trim: true
    },
    privileges: [{
        type: String,
        required: true
    }]
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});

const Role = mongoose.model('Role', roleSchema, 'roles');

module.exports = Role;