const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    connections: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("invalid password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    about: {
      type: String,
    },
    imgURL: {
      type: String,
      default:
        "https://img.freepik.com/premium-psd/contact-icon-illustration-isolated_23-2151903357.jpg?semt=ais_items_boosted&w=740",
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

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Rudra@007", {
    expiresIn: "7 days",
  });
  return token;
};

userSchema.methods.isPasswordValid = async function (userInputPassword) {
  const user = this;
  const isMatch = await bcrypt.compare(userInputPassword, user.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
