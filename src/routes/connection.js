const express = require("express");
const authMiddleware = require("../middlewares/auth");
const conncetionModel = require("../models/connectionRequest");
const User = require("../models/user");

const connectionRouter = express.Router();

connectionRouter.post(
  "/sendConncetionRequest/:status/:toUserId",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await req.user;
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

      const existingConection = await conncetionModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConection) {
        return res.status(400).json({ message: "Connection already exists" });
      }

      const newConnection = new conncetionModel({
        fromUserId,
        toUserId,
        status,
      });

      await newConnection.save();
      res.json({
        message: `${user.firstName}  sent  a connection request to ${toUser.firstName}`,
      });
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

module.exports = connectionRouter;
