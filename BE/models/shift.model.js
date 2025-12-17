const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const AssignedUserSchema = new mongoose.Schema({
  userid: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
}, { _id: false });

const ShiftSchema = new mongoose.Schema({
  shift_id: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  start_time: { type: String, required: true, trim: true }, 
  end_time: { type: String, required: true, trim: true },   
  department: { type: String, trim: true },
  instrument_id: { type: String, trim: true },
  assigned_users: { type: [AssignedUserSchema], default: [] },
  created_by: { type: String, trim: true },
  updated_by: { type: String, trim: true },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['planned', 'published', 'cancelled'], default: 'planned' },
}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false
});

ShiftSchema.index({ date: 1 });
ShiftSchema.index({ instrument_id: 1, date: 1 });
ShiftSchema.index({ 'assigned_users.userid': 1, date: 1 });

module.exports = mongoose.model('Shift', ShiftSchema, 'shifts');
