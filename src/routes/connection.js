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
      const user = req.user;
      if (!user) {
        throw new Error("User not found");
      }

      const fromUserId = user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatuses = ["interested", "ignored"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" + status });
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

connectionRouter.post(
  "/request/review/:status/:requestedId",
  authMiddleware,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestedId = req.params.requestedId;

      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // const requestObjectId = new mongoose.Types.ObjectId(requestedId);

      const connectionRequest = await connectionModel.findOne({
        _id: requestedId,
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
      const data = await connectionRequest.save();

      res.json({
        message: "Connection request reviewed successfully" + status,
        data,
      });
    } catch (error) {
      console.error("🔥 Error reviewing request:", error);
      res.status(400).send(error.message);
    }
  }
);
// Add this to your user route or wherever you fetch connections
// Get all connections for a specific user
connectionRouter.get("/connections", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted connections where the user is either the sender or receiver
    const connections = await connectionModel
      .find({
        $or: [
          { fromUserId: userId, status: "accepted" },
          { toUserId: userId, status: "accepted" },
        ],
      })
      .populate("fromUserId toUserId");

    // Format the connections to show the other user in each connection
    const formattedConnections = connections.map((conn) => {
      // If the current user is the fromUser, return the toUser details, otherwise return the fromUser details
      const connectionUser = conn.fromUserId._id.equals(userId)
        ? conn.toUserId
        : conn.fromUserId;

      return {
        connectionId: conn._id,
        user: {
          _id: connectionUser._id,
          firstName: connectionUser.firstName,
          lastName: connectionUser.lastName,
          imgURL: connectionUser.imgURL,
          age: connectionUser.age,
          gender: connectionUser.gender,
          about: connectionUser.about,
          // Add any other user fields you want to include
        },
      };
    });

    res.json({ data: formattedConnections });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = connectionRouter;
