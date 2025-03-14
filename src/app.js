const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const connectionRouter = require("./routes/connection");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", connectionRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
const connectDb = require("./config/database");
const user = require("./models/user");
require("./config/database");
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
