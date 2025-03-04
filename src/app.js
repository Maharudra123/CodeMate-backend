const express = require("express");
const app = express();
const connectDb = require("./config/database");
require("./config/database");
const User = require("./models/user");
connectDb()
  .then(() => {
    console.log("Connection successful! ");
    app.listen(7777, () => {
      console.log("Server running on port 7777");
    });
  })
  .catch((err) => {
    console.log(err, "Connection failed!");
  });

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "DImple",
    lastName: "Mathe",
    emailId: "sakshimathe0@gmail.com",
    password: "dimple",
    age: 21,
  });
  try {
    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
