const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const TestOrderSchema = new mongoose.Schema({
  userid: { 
    type: String,  
    required: true,
    index: true
  },
  created_by: { 
    type: String,  
    required: true 
  },
  order_code: { 
    type: String, 
    required: true,
    unique: true
  },
  patient_name: { 
    type: String, 
    required: true
  },
  date_of_birth: { 
    type: Date
  },
  gender: { 
    type: String
  },
  age: { 
    type: Number
  },
  address: { 
    type: String
  },
  phone_number: { 
    type: String
  },
  email: { 
    type: String
  },
  status: { 
    type: String, 
    default: 'pending',
    index: true
  },
  priority: { 
    type: String, 
    default: 'normal'
  },
  test_type: { 
    type: String,
    enum: ['Blood Test', 'Kidney Function Test', 'Urinalysis', 'Fecal Analysis'],
    required: true
  },
  notes: { 
    type: String
  },

}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false
});


TestOrderSchema.index({ userid: 1, createdAt: -1 });
TestOrderSchema.index({ created_by: 1, createdAt: -1 });
TestOrderSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('test_orders', TestOrderSchema, 'test_orders');
