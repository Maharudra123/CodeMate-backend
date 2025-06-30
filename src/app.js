const http = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth");
const connectionRouter = require("./routes/connection");
const profileRouter = require("./routes/profile");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");
const connectDb = require("./config/database");
const user = require("./models/user");
const cors = require("cors");
require("dotenv").config();
// require("./cron/emailcorn");

const app = express();

const server = http.createServer(app);

console.log(process.env.PORT); // remove this after you've confirmed it is working

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://code-mate-frontend-alpha.vercel.app/landing"],
    credentials: true,
  })
);
app.use("/", authRouter);
app.use("/", connectionRouter);
app.use("/", profileRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

initializeSocket(server);

const PORT = process.env.PORT || 7777;
require("./config/database");
connectDb()
  .then(() => {
    console.log("DB Connection successful! ");
    server.listen(PORT, () => {
      console.log(`"Server running on port ${PORT}"`);
    });
  })
  .catch((err) => {
    console.log(err, "Connection failed!");
  });
