const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const consultationController = require("../controllers/consultation.controller");
const { updateStatus } = require("../controllers/consultation.controller");

// 📌 Lấy tất cả nurses (để user chọn khi đặt lịch)
router.get("/nurses/all", consultationController.getAllNurses);

// 📌 Tạo lịch tư vấn (user tạo request)
router.post("/request", verifyToken, consultationController.requestConsultation);

// 📌 Lấy tất cả lịch tư vấn của user (lấy từ token, không cần params)
router.get("/my-consultations", verifyToken, consultationController.getConsultationsByUser);

// 📌 Lấy tất cả lịch tư vấn của nurse (theo nurseId)
router.get("/nurse/:nurseId", verifyToken, consultationController.getConsultationsByNurse);

// 📌 Lấy token ZegoCloud khi vào phòng
router.get("/zego-token", verifyToken, consultationController.getZegoToken);

router.put("/status/:consultationId", verifyToken, updateStatus);


module.exports = router;
