const mongoose = require("mongoose");
const User = require("./user");
const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "rejected", "accepted"],
        message: `{VALUE} is incorrect status type!`,
      },
    },
  },
  { timestamps: true }
);
connectionRequestSchema.pre("save", async function (next) {
  const connectionRequest = this;
  if (connectionRequest.toUserId.equals(connectionRequest.fromUserId)) {
    return next(new Error("You can't send a connection request to yourself!"));
  }
});
const conncetionModel = mongoose.model(
  "connectionRequestModel",
  connectionRequestSchema
);

module.exports = conncetionModel;
