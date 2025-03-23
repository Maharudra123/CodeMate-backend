const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const connectionRouter = require("./routes/connection");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use("/", authRouter);
app.use("/", connectionRouter);
app.use("/", profileRouter);
app.use("/", userRouter);

const connectDb = require("./config/database");

const user = require("./models/user");
const PORT = process.env.PORT;
require("./config/database");
connectDb()
  .then(() => {
    console.log("Connection successful! ");
    app.listen(PORT, () => {
      console.log(`"Server running on port ${PORT}"`);
    });
  })
  .catch((err) => {
    console.log(err, "Connection failed!");
  });
