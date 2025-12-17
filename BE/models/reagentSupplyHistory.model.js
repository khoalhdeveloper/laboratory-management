const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const reagentSupplyHistorySchema = new mongoose.Schema({
    supply_id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    reagent_name: {
        type: String,
        required: true,
        trim: true
    },
    catalog_number: {
        type: String,
        required: true,
        trim: true
    },
    vendor_name: {
        type: String,
        required: true,
        trim: true
    },
    vendor_id: {
        type: String,
        required: true,
        trim: true
    },
    po_number: {
        type: String,
        required: true,
        trim: true
    },
    order_date: {
        type: Date,
        required: true
    },
    receipt_date: {
        type: Date,
        required: true
    },
    quantity_received: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    unit_of_measure: {
        type: String,
        required: true,
        trim: true
    },
    lot_number: {
        type: String,
        required: true,
        trim: true
    },
    expiration_date: {
        type: Date,
        required: true
    },
    received_by_doctor: {
        type: String,
        required: true,
        trim: true
    },
    storage_location: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['received', 'partial_shipment', 'returned'],
        default: 'received'
    }
}, {
    timestamps: { currentTime: getVNTime },
    versionKey: false
});


reagentSupplyHistorySchema.index({ reagent_name: 1 });
reagentSupplyHistorySchema.index({ catalog_number: 1 });
reagentSupplyHistorySchema.index({ vendor_id: 1 });
reagentSupplyHistorySchema.index({ po_number: 1 });
reagentSupplyHistorySchema.index({ lot_number: 1 });

const ReagentSupplyHistory = mongoose.model('ReagentSupplyHistory', reagentSupplyHistorySchema, 'reagent_supply_history');

module.exports = ReagentSupplyHistory;