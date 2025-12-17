const mongoose = require("mongoose");
const { getVNTime } = require('../helpers/time.helper');

const ConsultationSchema = new mongoose.Schema(
  {
    consultationId: { type: String, required: true, unique: true },
    userid: { type: String, required: true },   // người tạo (patient)
    patientName: { type: String },              // fullName của patient (tự động lấy)
    nurseId: { type: String, required: true },  // userid của nurse
    nurseName: { type: String },                // fullName của nurse (tự động lấy)
    scheduledTime: { type: Date, required: true },
    endTime: { type: Date },
    notes: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
    meetingLink: { type: String },
  },
  { 
  timestamps: { currentTime: getVNTime },
  versionKey: false
}
);

module.exports = mongoose.model("Consultation", ConsultationSchema);
