const Consultation = require("../models/consultation.model");
const Account = require("../models/account.model");
const { v4: uuidv4 } = require("uuid");
const { generateZegoToken } = require("../utils/zegoToken");

exports.requestConsultation = async (req, res) => {
  try {
    const { nurseUsername, scheduledTime, notes } = req.body;
    const userid = req.user?.userid;

    if (!userid) {
      return res.status(401).json({ message: "Cannot determine user from token" });
    }

    if (!nurseUsername || !scheduledTime) {
      return res.status(400).json({ message: "Missing required information (nurseUsername, scheduledTime)" });
    }

    const nurse = await Account.findOne({ username: nurseUsername, role: "nurse" });
    if (!nurse) {
      return res.status(404).json({ message: "Cannot find valid nurse account" });
    }

    const patient = await Account.findOne({ userid });
    if (!patient) {
      return res.status(404).json({ message: "Cannot find patient information" });
    }

    const consultationId = uuidv4();
    const endTime = new Date(new Date(scheduledTime).getTime() + 30 * 60000);

    const zegoToken = generateZegoToken(consultationId, userid);

    const meetingLink = `/zegocloud-room/${consultationId}`;

    const newConsult = await Consultation.create({
      consultationId,
      userid,
      patientName: patient.fullName,
      nurseId: nurse.userid,
      nurseName: nurse.fullName,
      scheduledTime,
      endTime,
      notes,
      status: "pending",
      meetingLink,
      zegoToken: zegoToken.token,
    });

    res.status(201).json({
      message: "Create consultation successfully (ZegoCloud)",
      data: newConsult,
    });
  } catch (error) {
    console.error("❌ Error creating consultation:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getZegoToken = async (req, res) => {
  try {
    const { consultationId, userId } = req.query;
    if (!consultationId || !userId) {
      return res.status(400).json({ message: "Missing consultationId or userId parameter" });
    }

    const tokenData = generateZegoToken(consultationId, userId);
    res.json(tokenData);
  } catch (err) {
    console.error("❌ Error creating ZegoCloud token:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllNurses = async (req, res) => {
  try {
    const nurses = await Account.find({ role: "nurse" }).select("-password");
    res.json(nurses);
  } catch (err) {
    console.error("❌ Error getting nurse list:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getConsultationsByUser = async (req, res) => {
  try {
    const userid = req.user?.userid;
    if (!userid) {
      return res.status(401).json({ message: "Cannot determine user from token" });
    }

    const consultations = await Consultation.find({ userid }).sort({ scheduledTime: -1 });

    const withNurseInfo = await Promise.all(
      consultations.map(async (c) => {
        const nurse = await Account.findOne({ userid: c.nurseId }).select("fullName username");
        return {
          ...c.toObject(),
          nurseName: nurse?.fullName,
          nurseUsername: nurse?.username,
        };
      })
    );

    res.json(withNurseInfo);
  } catch (err) {
    console.error("❌ Error getting user consultations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getConsultationsByNurse = async (req, res) => {
  try {
    const { nurseId } = req.params;
    if (!nurseId) {
        return res.status(400).json({ message: "Missing nurseId parameter" });
    }

    const consultations = await Consultation.find({ nurseId }).sort({ scheduledTime: -1 });

    const withPatientInfo = await Promise.all(
      consultations.map(async (c) => {
        const patient = await Account.findOne({ userid: c.userid }).select("fullName username");
        return {
          ...c.toObject(),
          patientName: patient?.fullName,
          patientUsername: patient?.username,
        };
      })
    );

    res.json(withPatientInfo);
  } catch (err) {
    console.error("❌ Error getting nurse consultations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Consultation.findOneAndUpdate(
      { consultationId },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Cannot find consultation" });
    }

    res.json({ message: "Update status successfully", data: updated });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
