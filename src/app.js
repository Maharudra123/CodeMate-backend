const express = require("express");
const app = express();
app.use(express.json());
const connectDb = require("./config/database");
require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("./utils/validate");
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
  try {
    const { firstName, lastName, emailId, password } = req.body;
    validateSignupData(req);
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      skills,
      imgURL,
    });
    console.log(hashedPassword);

    await user.save();
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    res.send("User logged in successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.get("/users", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      throw new Error("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send(error.message || error);
  }
});

app.delete("/users", async (req, res) => {
  try {
    const userId = req.body.userId;
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send("User not  deleted");
  }
});

app.patch("/users/:userId", async (req, res) => {
  try {
    const isSkillsUpdateAllowed = req.body.skills.length <= 15;
    if (!isSkillsUpdateAllowed) {
      throw new Error("max skills allowed is 20");
    }
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "password",
      "age",
      "imgURL",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(req.body).every((update) =>
      ALLOWED_UPDATES.includes(update)
    );
    if (!isUpdateAllowed) {
      throw new Error("Invalid updates");
    }
    const userId = req.params?.userId;
    const data = req.body;

    await User.findByIdAndUpdate({ _id: userId }, data);
    console.log(data);
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("User not updated" + error.message);
  }
});

app.get("/findById", async (req, res) => {
  try {
    const userID = req.body.userId;
    const findUser = await User.findById({ _id: userID });
    if (!findUser) {
      throw new Error("User not found");
    } else {
      res.send(findUser);
    }
  } catch {
    res.status(400).send("User not found");
  }
});
app.get("/feed", async (req, res) => {
  try {
    const feed = await User.find({});
    res.send(feed);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
