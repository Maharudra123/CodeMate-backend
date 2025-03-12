const express = require("express");
const authMiddleware = require("../middlewares/auth");

const connectionRouter = express.Router();

connectionRouter.post(
  "/sendConncetionRequest",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await req.user;
      if (!user) {
        throw new Error("User not found");
      }
      res.send(user.firstName + ", sent a connection request");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

module.exports = connectionRouter;
