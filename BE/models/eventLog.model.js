const { version } = require("joi");
const mongoose = require("mongoose");
const { getVNTime } = require('../helpers/time.helper');

const eventLogSchema = new mongoose.Schema({
  event_id: { type: String, required: true },
  message: { type: String, required: true },
  performedBy: { type: String },
  role: { type: String },
  
}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false
});

module.exports = mongoose.model("EventLog", eventLogSchema);
