const mongoose = require('mongoose');

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
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const Role = mongoose.model('Role', roleSchema, 'roles');

module.exports = Role;