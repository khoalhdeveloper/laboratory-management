const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const accountHistorySchema = new mongoose.Schema(
  {
    userid: { type: String, required: true },
    action: { type: String, required: true },
    fieldChanges: [
      {
        field: String,
        oldValue: String,
        newValue: String,
      },
    ],
    performedBy: { type: String },
  },
  { 
    timestamps: { currentTime: getVNTime },
    versionKey: false
  }
);

module.exports = mongoose.model('accounthistories', accountHistorySchema);
