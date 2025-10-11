const mongoose = require('mongoose');

const TestOrderSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', 
    required: true
  },
  test_order_id: { type: String },
  created_by: { type: String, required: false },
  order_code: { type: String, required: true },
  patient_name: { type: String, required: true },
  date_of_birth: { type: Date, required: false },
  gender: { type: String, required: false },
  age: { type: Number, required: false },
  address: { type: String, required: false },
  phone_number: { type: String, required: false },
  email: { type: String, required: false },
  status: { type: String, default: 'pending' },
  priority: { type: String, required: false },
  test_type: { type: String, required: false },
  notes: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, {
  collection: 'test_orders',
  versionKey: false
});

module.exports = mongoose.model('test_orders', TestOrderSchema);
