const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Chat = require("../models/chat");
const user = require("../models/user");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", authMiddleware, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      console.log("chat is empty", chat);
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
        firstName,
      });
      console.log("chat created");
      await chat.save();
    }
    res.json({ chat });
  } catch (error) {
    console.error(error.message);
  }
});
chatRouter.get("/chat/user/:targetUserId", async (req, res) => {
  try {
    const User = await user
      .findById(req.params.targetUserId)
      .select("firstName lastName imgURL lastSeen");
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found", User);
    res.json({ User });
  } catch (error) {
    console.error(error.message);
  }
});

module.exports = chatRouter;
