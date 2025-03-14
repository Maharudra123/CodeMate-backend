const express = require("express");
const authMiddleware = require("../middlewares/auth");
const conncetionModel = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests/recived", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const connectionRequests = await conncetionModel
      .find({
        toUserId: loggedInUser._id, // Fix field name
        status: "interested",
      })
      .populate(
        "fromUserId", // This should be correct
        "firstName lastName photoURL age gender about skills"
      );

    if (!connectionRequests) {
      return res.status(404).json({ message: "No connection requests" });
    }

    res.json({ data: connectionRequests });
  } catch (error) {
    res.json({ message: error.message });
  }
});

userRouter.get("/user/connections", authMiddleware, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const connectionRequests = await conncetionModel
      .find({
        $or: [
          { fromUserId: loggedInUser._id, status: "accepted" },
          { toUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate(
        "fromUserId",
        "firstName lastName photoURL age gender about skills"
      )
      .populate(
        "toUserId",
        "firstName lastName photoURL age gender about skills"
      );
    const data = connectionRequests.map((row) => {
      if (row.fromUserId.toString() === row.toUserId.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = userRouter;
