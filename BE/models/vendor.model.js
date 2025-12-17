const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const vendorSchema = new mongoose.Schema({
    vendor_id: {
        type: String,
        required: true,
        trim: true
    },
    vendor_name: {
        type: String,
        required: true,
        trim: true
    },
    contact_info: {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        }
    }
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});


vendorSchema.index({ vendor_id: 1 });
vendorSchema.index({ vendor_name: 1 });

const Vendor = mongoose.model('Vendor', vendorSchema, 'vendors');

module.exports = Vendor;