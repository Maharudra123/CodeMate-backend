const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("oye dimple");
});
app.get("/hehe", (req, res) => {
  res.send("oye dimple, jevlis ka");
});
app.get("/dimple", (req, res) => {
  res.send("oye dimple, love you");
});
app.listen(7777, () => {
  console.log("Server is running on port 7777");
});
