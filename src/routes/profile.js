const express = require("express");
const authMiddleware = require("../middlewares/auth");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { validateEditProfileData } = require("../utils/validate");
profileRouter.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await req.user;

    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

profileRouter.patch("/profile/edit", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    // Validate edits
    const isEditAllowed = validateEditProfileData(req);
    if (!isEditAllowed) {
      throw new Error("Invalid updates. You can only update allowed fields.");
    }

    Object.keys(req.body).forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.send("Updated successfully: " + JSON.stringify(user));
  } catch (error) {
    res.status(400).send(error.message + "all fields are required!");
  }
});

profileRouter.patch(
  "/profile/update-password",
  authMiddleware,
  async (req, res) => {
    try {
      const user = req.user;
      const { oldPassword, newPassword } = req.body;
      const isOldPasswordMatch = bcrypt.compare(oldPassword, user.password);
      if (!isOldPasswordMatch) {
        res.status(400).send("old password is not match");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
      res.send("password updated succesfully! ");
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

module.exports = profileRouter;
