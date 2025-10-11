const express = require("express");
const router = express.Router();
const { useReagents, useReagentsForInstrument, getReagentUsageHistory } = require("../controllers/reagentUsage.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");

// Chỉ cho phép role NURSE, DOCTOR hoặc ADMIN dùng thuốc
router.post("/use", verifyToken, authorizeRole(['admin','doctor','nurse']), useReagents);

// Dùng thuốc cho thiết bị cụ thể
router.post("/use-for-instrument", verifyToken, authorizeRole(['admin','doctor','nurse']), useReagentsForInstrument);

// Xem lịch sử dùng thuốc (tất cả role được xem)
router.get("/history", verifyToken, getReagentUsageHistory);

module.exports = router;
