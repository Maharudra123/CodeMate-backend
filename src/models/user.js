const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 4,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("invalid email");
        }
      },
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("password is not strong enough");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    imgURL: {
      type: String,
      default:
        "https://res.cloudinary.com/devtinder/image/upload/v1623663942/blank-profile-picture-973460_1280_zxw1zv.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("invalid image url");
        }
      },
    },
    skills: {
      type: [String],
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("invalid gender type");
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
