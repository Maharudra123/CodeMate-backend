const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connection success");
  } catch (error) {
    console.error("connection failed" + error);
  }
};

module.exports = connectDb;
