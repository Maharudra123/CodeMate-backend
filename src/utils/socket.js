const socket = require("socket.io");
const Chat = require("../models/chat");
const User = require("../models/user"); // Changed from lowercase to uppercase for consistency

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "https://tinder-for-geeks.vercel.app"],
    },
  });

  // Store user connections for tracking
  const userConnections = new Map();

  io.on("connection", (socket) => {
    let currentUserId = null;

    socket.on("joinChat", ({ userId, targetUserId }) => {
      // Store the current user's ID for later use in disconnect
      currentUserId = userId;

      // Add this connection to our tracking map
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set());
      }
      userConnections.get(userId).add(socket.id);

      const roomId = [userId, targetUserId].sort().join("_");
      socket.join(roomId);

      // Update user status to online
      User.findByIdAndUpdate(userId, { isOnline: true }).catch((err) =>
        console.error("Error updating online status:", err)
      );
    });

    socket.on(
      "sendMessage",
      async ({ message, firstName, userId, targetUserId }) => {
        const roomId = [userId, targetUserId].sort().join("_");

        try {
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
            console.log("Chat created");
            await chat.save();
          }

          chat.messages.push({
            senderId: userId,
            message,
            timestamp: new Date(),
          });
          await chat.save();

          io.to(roomId).emit("messageRecived", {
            message: message,
            firstName: firstName,
            senderId: userId,
            timeStamp: new Date().toISOString(),
          });
          console.log(`firstName: ${firstName}, message: ${message}`);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("errorMessage", { error: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", async () => {
      if (currentUserId) {
        // Remove this socket connection
        const userSockets = userConnections.get(currentUserId);
        if (userSockets) {
          userSockets.delete(socket.id);

          // If this was the user's last connection, mark them as offline
          if (userSockets.size === 0) {
            userConnections.delete(currentUserId);
            try {
              await User.findByIdAndUpdate(currentUserId, {
                lastSeen: new Date(),
                isOnline: false,
              });
            } catch (err) {
              console.error("Error updating user status:", err);
            }
          }
        }
      }
      console.log("User disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });
};

module.exports = initializeSocket;
