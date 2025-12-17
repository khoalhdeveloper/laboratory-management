
const express = require("express");
const { chatController } = require("../controllers/chat.controller");
const { verifyToken, optionalVerifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();


router.post("/chatai", optionalVerifyToken, chatController.chat);

router.get("/historyAiChat", verifyToken, chatController.getChatHistory);

module.exports = router;
