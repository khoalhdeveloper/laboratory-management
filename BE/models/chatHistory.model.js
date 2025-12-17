const mongoose = require('mongoose');
const { getVNTime } = require('../helpers/time.helper');

const chatHistorySchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sessionId: {
    type: String,
    required: true
  }
}, {
  timestamps: { currentTime: getVNTime },
  versionKey: false
});


chatHistorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


chatHistorySchema.index({ userid: 1, createdAt: -1 });
chatHistorySchema.index({ sessionId: 1 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
