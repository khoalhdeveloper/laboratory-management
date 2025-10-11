const mongoose = require('mongoose');

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
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,  
    versionKey: false   
});

module.exports = mongoose.model('Reagent', ReagentSchema, 'reagents');