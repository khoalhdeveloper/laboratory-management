const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const TestResultSchema = new mongoose.Schema({
  order_code: {
    type: String,
    required: true,
  },
  test_type: {
    type: String,
    enum: ['Blood Test', 'Urinalysis', 'Fecal Analysis', 'Kidney Function Test'],
    required: true,
  },
  doctor_id: {
    type: String,
    required: true,
  },
  doctor_name: {
    type: String,
    required: true,
  },
  instrument_id: {
    type: String,  
    required: false,
  },
  instrument_name: {
    type: String,
    required: false,  
  },
  result_summary: {
    type: String,
    required: true,  
  },
  result_details: {
    type: String,
    required: false,  
  },
  
  // ========== Blood Test Parameters (CBC) ==========
  wbc_value: { type: Number, required: false },
  rbc_value: { type: Number, required: false },
  hgb_value: { type: Number, required: false },
  hct_value: { type: Number, required: false },
  plt_value: { type: Number, required: false },
  mcv_value: { type: Number, required: false },
  mch_value: { type: Number, required: false },
  mchc_value: { type: Number, required: false },
  

  // ========== Urinalysis Parameters ==========
  leu_value: { type: String, required: false },
  nit_value: { type: String, required: false },
  pro_value: { type: String, required: false },
  ph_value: { type: Number, required: false },
  bld_value: { type: String, required: false },
  sg_value: { type: Number, required: false },
  ket_value: { type: String, required: false },
  glu_value: { type: String, required: false },
  
  // ========== Fecal Analysis Parameters ==========
  fobt_value: { type: String, required: false },
  wbcs_value: { type: String, required: false },
  fecal_fat: { type: Number, required: false },
  O_and_P: { type: String, required: false },
  rs_value: { type: String, required: false },
  fc_value: { type: Number, required: false },
  color: { type: String, required: false },
  
  
  flag: {
    type: Object,
    required: false,  
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'revised'],
    default: 'completed',  
  },
  comments: [{
    comment_id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    doctor_name: {
      type: String,
      required: true
    },
    doctor_id: {
      type: String,
      required: true
    },
    is_final: {
      type: Boolean,
      default: false
    },
   
  }],
  ai_description: {
    type: String,
    required: false,
    default: "",
    trim: true
  },

}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false,
});


TestResultSchema.index({ instrument_id: 1 });
TestResultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('test_results', TestResultSchema, 'test_results');
