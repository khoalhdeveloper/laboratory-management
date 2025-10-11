const mongoose = require('mongoose');

const instrumentConfigSchema = new mongoose.Schema(
  {
    instrument_id: {
      type: String,
      required: true,
      ref: 'Instrument',
    },
    config_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // ✅ giữ đồng bộ với instrument
    versionKey: false,
  }
);

module.exports = mongoose.model('InstrumentConfiguration', instrumentConfigSchema, 'instrument_configurations');
