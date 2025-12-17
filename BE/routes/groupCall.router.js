const express = require("express");
const { groupCallController } = require("../controllers/groupCall.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

const router = express.Router();

// Create a new group call room
router.post("/create", verifyToken, groupCallController.createRoom);

// Invite participants to a room
router.post("/:roomId/invite", verifyToken, groupCallController.inviteParticipants);

// Join a room
router.post("/:roomId/join", verifyToken, groupCallController.joinRoom);

// Leave a room
router.post("/:roomId/leave", verifyToken, groupCallController.leaveRoom);

// Get room details
router.get("/:roomId", verifyToken, groupCallController.getRoomDetails);

// Get user's rooms
router.get("/my/rooms", verifyToken, groupCallController.getMyRooms);

// End a room (host only)
router.post("/:roomId/end", verifyToken, groupCallController.endRoom);

module.exports = router;
