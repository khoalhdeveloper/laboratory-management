const { chatWithAI } = require("../helpers/aiClient");
const ChatHistory = require("../models/chatHistory.model");
const { v4: uuidv4 } = require('uuid');

const chatController = {
  async chat(req, res) {
    try {
      const { text, model, sessionId } = req.body;
      const userid = req.user?.userid || req.user?.userId;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text must be a string" });
      }

      // Call AI
      const reply = await chatWithAI(text, model);

      // Only save to database if user is authenticated
      if (userid) {
        // Generate sessionId if not provided
        const currentSessionId = sessionId || uuidv4();

        // Save to database
        let chatHistory = await ChatHistory.findOne({ 
          userid, 
          sessionId: currentSessionId 
        });

        if (!chatHistory) {
          chatHistory = new ChatHistory({
            userid,
            sessionId: currentSessionId,
            messages: []
          });
        }

        // Add user message
        chatHistory.messages.push({
          role: 'user',
          content: text,
          timestamp: new Date()
        });

        // Add AI response
        chatHistory.messages.push({
          role: 'ai',
          content: reply.content,
          timestamp: new Date()
        });

        await chatHistory.save();

        return res.json({ 
          reply,
          sessionId: currentSessionId,
          historySaved: true
        });
      }

      // Return reply without saving if not authenticated
      return res.json({ 
        reply,
        historySaved: false
      });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  // Get chat history for a user
  async getChatHistory(req, res) {
    try {
      const userid = req.user?.userid || req.user?.userId || req.params.userid;

      if (!userid) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const { sessionId, limit = 50, skip = 0 } = req.query;

      let query = { userid };
      if (sessionId) {
        query.sessionId = sessionId;
      }

      const history = await ChatHistory.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      return res.json({ history });
    } catch (err) {
      console.error("Get chat history error:", err);
      res.status(500).json({ error: err.message });
    }
  }
};

module.exports = { chatController };
