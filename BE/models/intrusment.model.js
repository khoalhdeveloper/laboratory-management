const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const instrumentSchema = new mongoose.Schema(
  {
    instrument_id: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    serial_number: {
      type: String,
      required: true,
      unique: true,
    },
    room: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'In Use', 'Maintenance', 'Out of Service'],
      default: 'Available',
    },
    last_check: {
      type: Date,
      default: null,
    },
    next_check: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { currentTime: getVNTime },
    versionKey: false,
  }
);


module.exports = mongoose.model('Instrument', instrumentSchema, 'instruments');
