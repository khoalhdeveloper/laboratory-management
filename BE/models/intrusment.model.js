const mongoose = require('mongoose');

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
    instrument_code: String,
    description: String,
    status: {
      type: String,
      enum: ['Ready', 'Maintenance', 'Inactive'],
      default: 'Ready',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

// 🧠 Tự động sinh mã ID dạng INS-001, INS-002...
instrumentSchema.pre('save', async function (next) {
  if (this.instrument_id) return next();

  const count = await mongoose.model('Instrument').countDocuments();
  this.instrument_id = `INS-${String(count + 1).padStart(3, '0')}`;
  next();
});

module.exports = mongoose.model('Instrument', instrumentSchema, 'instruments');
