const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['stable', 'critical', 'recovering', 'observation'],
        default: 'observation'
    },
    contactInfo: {
        phone: String,
        emergencyContact: String,
        address: String
    }
});

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    floor: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: {
            values: ['ICU', 'General', 'VIP', 'Emergency'],
            message: '{VALUE} is not a valid room type'
        },
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    occupied: {
        type: Number,
        default: 0
    },
    patients: [patientSchema],
    status: {
        type: String,
        enum: ['available', 'full', 'maintenance'],
        default: 'available'
    },
    notes: String
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});

// Update status automatically based on occupied vs actual room capacity
roomSchema.pre('save', function(next) {
    // Use the actual capacity of the room instead of hardcoded values
    if (this.occupied >= this.capacity) {
        this.status = 'full';
    } else if (this.status === 'full' && this.occupied < this.capacity) {
        this.status = 'available';
    }
    
    this.updatedAt = new Date();
    next();
});

// Update occupied count based on patients array length
roomSchema.pre('save', function(next) {
    this.occupied = this.patients.length;
    next();
});

module.exports = mongoose.model('Room', roomSchema);