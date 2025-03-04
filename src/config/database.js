const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://itsokyash_:UE8pRMgGfaRA1fTd@cluster0.7673q.mongodb.net/devTinder"
  );
};

module.exports = connectDb;
