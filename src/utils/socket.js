const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const areFriends = async (userId1, userId2) => {
  const connectionRequest = await ConnectionRequest.findOne({
    $or: [
      { fromUserId: userId1, toUserId: userId2, status: "accepted" },
      { fromUserId: userId2, toUserId: userId1, status: "accepted" },
    ],
  });
  return !!connectionRequest;
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) {
        socket.emit("error", { message: "userId and targetUserId are required" });
        return;
      }

      const isFriend = await areFriends(userId, targetUserId);
      if (!isFriend) {
        socket.emit("error", {
          message: "You can only chat with your connections",
        });
        return;
      }

      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        if (!userId || !targetUserId || !text) {
          socket.emit("error", {
            message: "userId, targetUserId and text are required",
          });
          return;
        }

        const isFriend = await areFriends(userId, targetUserId);
        if (!isFriend) {
          socket.emit("error", {
            message: "You can only send messages to your connections",
          });
          return;
        }

        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;