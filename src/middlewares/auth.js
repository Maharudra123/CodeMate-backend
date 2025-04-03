const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("token not found");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = authMiddleware;
