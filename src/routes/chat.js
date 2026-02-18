const express = require("express");
const { userAuth } = require("../middleware/auth");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const chatRouter = express.Router();

const areFriends = async (userId1, userId2) => {
  const connectionRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId1, toUserId: userId2, status: "accepted" },
      { fromUserId: userId2, toUserId: userId1, status: "accepted" },
    ],
  });
  return !!connectionRequest;
};

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  const limit = parseInt(req.query.limit) || 20; 
  const skip = parseInt(req.query.skip) || 0;

  try {
    const isFriend = await areFriends(userId, targetUserId);
    if (!isFriend) {
      return res.status(403).json({
        message: "You can only chat with your connections",
      });
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    // Get total message count before limiting
    const totalMessages = chat.messages.length;

    // Limit messages: get last (limit + skip) messages, then take last 'limit' messages
    // This gives us pagination from the end (newest messages)
    const startIndex = Math.max(0, totalMessages - limit - skip);
    const endIndex = totalMessages - skip;
    const limitedMessages = chat.messages.slice(startIndex, endIndex);

    res.json({
      participants: chat.participants,
      messages: limitedMessages,
      totalMessages,
      limit,
      skip,
      hasMore: skip + limit < totalMessages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load chat" });
  }
});

module.exports = chatRouter;