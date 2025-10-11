const mongoose = require('mongoose');

const reagentUsageSchema = new mongoose.Schema({
  reagent_name: { type: String, required: true },
  quantity_used: { type: Number, required: true },
  used_by: { type: String, required: true },
  role: { type: String, required: true },
  instrument_id: { type: String, required: false }, // ID của thiết bị sử dụng
  instrument_name: { type: String, required: false }, // Tên thiết bị
  procedure: { type: String, required: false }, // Quy trình sử dụng
  notes: { type: String, required: false }, // Ghi chú thêm
  used_at: { type: Date, default: Date.now },
}, {
  versionKey: false  
});

module.exports = mongoose.model('ReagentUsage', reagentUsageSchema);
