const EventLog = require('../models/eventLog.model');

// ===============================
// Get all event logs
// ===============================
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await EventLog.find().sort({ createdAt: -1 });

    res.status(200).json({
      total: logs.length,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching logs',
      error: err.message,
    });
  }
  
};
// ===============================
// Get event log for role doctor
// ===============================
exports.getDoctorLogs = async (req, res) => {
  try {
   
    const logs = await EventLog.find({
      $or: [
        { role: 'doctor' },
        { role: 'nurse' },

      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      total: logs.length,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching doctor logs',
      error: err.message,
    });
  }
};

