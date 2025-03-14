const express = require("express");
const authMiddleware = require("../middlewares/auth");
const connectionModel = require("../models/connectionRequest");
const User = require("../models/user");
const mongoose = require("mongoose");

const connectionRouter = express.Router();

// 📌 Send Connection Request
connectionRouter.post(
  "/request/send/:status/:toUserId",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user; // ❌ Removed unnecessary `await`
      if (!user) {
        throw new Error("User not found");
      }

      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatuses = ["interested", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingConnection = await connectionModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const newConnection = new connectionModel({
        fromUserId,
        toUserId,
        status,
      });

      await newConnection.save();
      res.json({
        message: `${user.firstName} sent a connection request to ${toUser.firstName}`,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

// 📌 Review Connection Request
connectionRouter.post(
  "/request/review/:status/:requestedId",
  authMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      if (!loggedInUser) {
        throw new Error("User not found");
      }

      const status = req.params.status;
      const requestedId = req.params.requestedId;

      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      console.log("🔍 Reviewing Connection Request:");
      console.log("Requested ID:", requestedId);
      console.log("Logged-in User ID:", loggedInUser._id);

      // ✅ Convert to ObjectId
      const requestObjectId = new mongoose.Types.ObjectId(requestedId);

      const connectionRequest = await connectionModel.findOne({
        _id: requestObjectId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        console.log("❌ Connection request not found!");
        return res
          .status(404)
          .json({ message: "Connection request not found!" });
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      res.json({ message: "Connection request reviewed successfully" });
    } catch (error) {
      console.error("🔥 Error reviewing request:", error);
      res.status(400).send(error.message);
    }
  }
);

module.exports = connectionRouter;
