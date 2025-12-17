const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const ReagentSchema = new mongoose.Schema({
    reagent_name: {
        type: String,
        required: true
    },
    catalog_number: {
        type: String,
        required: false
    },
    manufacturer: {
        type: String,
        required: false
    },
    cas_number: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    quantity_available: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'mL'
    },
    // Mảng lưu trữ các lô thuốc với hạn sử dụng khác nhau
    batches: [{
        lot_number: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        expiration_date: {
            type: Date,
            required: true
        },
        supply_id: {
            type: String,
            required: true
        },
        storage_location: {
            type: String,
            required: false
        },
        received_date: {
            type: Date,
            required: true
        }
    }],
    // Hạn sử dụng gần nhất (để dễ truy vấn)
    nearest_expiration_date: {
        type: Date,
        required: false
    },
   
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});

module.exports = mongoose.model('Reagent', ReagentSchema, 'reagents');