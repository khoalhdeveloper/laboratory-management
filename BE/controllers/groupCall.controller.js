const GroupCall = require('../models/groupCall.model');
const { v4: uuidv4 } = require('uuid');

const groupCallController = {
  // Create a new group call room
  async createRoom(req, res) {
    try {
      const { roomName, description, maxParticipants } = req.body;
      const hostId = req.user?.userid || req.user?.userId;
      const hostName = req.user?.username || req.user?.fullName;

      if (!hostId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!roomName) {
        return res.status(400).json({ error: "Room name is required" });
      }

      // Generate unique room ID
      const roomId = uuidv4();

      const groupCall = new GroupCall({
        roomId,
        roomName,
        hostId,
        hostName,
        description,
        maxParticipants: maxParticipants || 10,
        participants: [{
          userid: hostId,
          username: req.user?.username,
          fullName: hostName,
          status: 'joined',
          joinedAt: new Date()
        }]
      });

      await groupCall.save();

      return res.status(201).json({
        message: "Room created successfully",
        room: {
          roomId: groupCall.roomId,
          roomName: groupCall.roomName,
          hostId: groupCall.hostId,
          hostName: groupCall.hostName,
          description: groupCall.description,
          maxParticipants: groupCall.maxParticipants,
          startTime: groupCall.startTime,
          status: groupCall.status
        }
      });
    } catch (err) {
      console.error("Create room error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Invite participants to room
  async inviteParticipants(req, res) {
    try {
      const { roomId } = req.params;
      const { participants } = req.body; // Array of { userid, username, fullName }
      const hostId = req.user?.userid || req.user?.userId;

      if (!hostId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const room = await GroupCall.findOne({ roomId, status: 'active' });

      if (!room) {
        return res.status(404).json({ error: "Room not found or already ended" });
      }

      // Check if user is host
      if (room.hostId !== hostId) {
        return res.status(403).json({ error: "Only host can invite participants" });
      }

      // Check if room is full
      if (room.participants.length + participants.length > room.maxParticipants) {
        return res.status(400).json({ error: "Room capacity exceeded" });
      }

      // Add new participants
      const newParticipants = participants.map(p => ({
        userid: p.userid,
        username: p.username,
        fullName: p.fullName,
        status: 'invited',
        joinedAt: new Date()
      }));

      // Filter out duplicates
      const existingUserIds = room.participants.map(p => p.userid);
      const uniqueParticipants = newParticipants.filter(
        p => !existingUserIds.includes(p.userid)
      );

      room.participants.push(...uniqueParticipants);
      await room.save();

      return res.json({
        message: "Participants invited successfully",
        invitedCount: uniqueParticipants.length,
        participants: room.participants
      });
    } catch (err) {
      console.error("Invite participants error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Join a room
  async joinRoom(req, res) {
    try {
      const { roomId } = req.params;
      const userid = req.user?.userid || req.user?.userId;
      const username = req.user?.username;
      const fullName = req.user?.fullName || req.user?.username;

      if (!userid) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const room = await GroupCall.findOne({ roomId, status: 'active' });

      if (!room) {
        return res.status(404).json({ error: "Room not found or already ended" });
      }

      // Check if already in room
      const existingParticipant = room.participants.find(p => p.userid === userid);

      if (existingParticipant) {
        // Update status to joined
        existingParticipant.status = 'joined';
        existingParticipant.joinedAt = new Date();
      } else {
        // Check room capacity
        if (room.participants.length >= room.maxParticipants) {
          return res.status(400).json({ error: "Room is full" });
        }

        // Add as new participant
        room.participants.push({
          userid,
          username,
          fullName,
          status: 'joined',
          joinedAt: new Date()
        });
      }

      await room.save();

      return res.json({
        message: "Joined room successfully",
        room: {
          roomId: room.roomId,
          roomName: room.roomName,
          hostId: room.hostId,
          hostName: room.hostName,
          description: room.description,
          participants: room.participants.filter(p => p.status === 'joined'),
          participantCount: room.participants.filter(p => p.status === 'joined').length
        }
      });
    } catch (err) {
      console.error("Join room error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Leave a room - Remove participant from room
  async leaveRoom(req, res) {
    try {
      const { roomId } = req.params;
      const userid = req.user?.userid || req.user?.userId;

      if (!userid) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const room = await GroupCall.findOne({ roomId });

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const participant = room.participants.find(p => p.userid === userid);

      if (!participant) {
        return res.status(404).json({ error: "You are not in this room" });
      }

      // Remove participant from the room
      room.participants = room.participants.filter(p => p.userid !== userid);

      // If host leaves, delete the entire room
      if (userid === room.hostId) {
        await GroupCall.deleteOne({ roomId });
        return res.json({
          message: "Left room successfully. Room has been deleted as host left.",
          roomDeleted: true
        });
      }

      await room.save();

      return res.json({
        message: "Left room successfully",
        roomDeleted: false
      });
    } catch (err) {
      console.error("Leave room error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get room details
  async getRoomDetails(req, res) {
    try {
      const { roomId } = req.params;

      const room = await GroupCall.findOne({ roomId });

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      return res.json({
        room: {
          roomId: room.roomId,
          roomName: room.roomName,
          hostId: room.hostId,
          hostName: room.hostName,
          description: room.description,
          status: room.status,
          startTime: room.startTime,
          endTime: room.endTime,
          maxParticipants: room.maxParticipants,
          participants: room.participants,
          activeParticipants: room.participants.filter(p => p.status === 'joined').length
        }
      });
    } catch (err) {
      console.error("Get room details error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get user's rooms (as host or participant)
  async getMyRooms(req, res) {
    try {
      const userid = req.user?.userid || req.user?.userId;

      if (!userid) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { status = 'active' } = req.query;

      // Find rooms where user is host or participant
      const rooms = await GroupCall.find({
        $or: [
          { hostId: userid },
          { 'participants.userid': userid }
        ],
        ...(status && { status })
      })
      .sort({ startTime: -1 })
      .limit(50);

      const roomList = rooms.map(room => ({
        roomId: room.roomId,
        roomName: room.roomName,
        hostId: room.hostId,
        hostName: room.hostName,
        description: room.description,
        status: room.status,
        startTime: room.startTime,
        endTime: room.endTime,
        isHost: room.hostId === userid,
        participants: room.participants, // Include full participants array
        participantCount: room.participants.filter(p => p.status === 'joined').length,
        maxParticipants: room.maxParticipants
      }));

      return res.json({ rooms: roomList });
    } catch (err) {
      console.error("Get my rooms error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // End a room (host only) - Delete the room
  async endRoom(req, res) {
    try {
      const { roomId } = req.params;
      const hostId = req.user?.userid || req.user?.userId;

      if (!hostId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const room = await GroupCall.findOne({ roomId });

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      if (room.hostId !== hostId) {
        return res.status(403).json({ error: "Only host can end the room" });
      }

      await GroupCall.deleteOne({ roomId });

      return res.json({
        message: "Room ended and deleted successfully"
      });
    } catch (err) {
      console.error("End room error:", err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = { groupCallController };
