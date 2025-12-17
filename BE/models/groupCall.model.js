const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const groupCallSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roomName: {
    type: String,
    required: true
  },
  hostId: {
    type: String,
    required: true,
    index: true
  },
  hostName: {
    type: String,
    required: true
  },
  participants: [{
    userid: {
      type: String,
      required: true
    },
    username: String,
    fullName: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: Date,
    status: {
      type: String,
      enum: ['invited', 'joined', 'left'],
      default: 'invited'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  description: String,
  maxParticipants: {
    type: Number,
    default: 10
  }
}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false
});

// Index for faster queries
groupCallSchema.index({ hostId: 1, status: 1 });
groupCallSchema.index({ 'participants.userid': 1 });
groupCallSchema.index({ status: 1, startTime: -1 });

const GroupCall = mongoose.model('GroupCall', groupCallSchema);

module.exports = GroupCall;
