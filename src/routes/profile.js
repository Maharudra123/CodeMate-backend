const express = require("express");
const authMiddleware = require("../middlewares/auth");
const profileRouter = express.Router();
const cookieParser = require("cookie-parser");
profileRouter.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await req.user;

    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = profileRouter;
