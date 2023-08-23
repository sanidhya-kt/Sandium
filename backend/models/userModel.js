const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // inbuild dependency

// user Schema module

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your Full name"],
    maxLength: [30, "Not more than 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter your valid Email Address"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"], // check weather email is valid or not
  },
  password: {
    type: String,
    required: [true, "Please Enter Valid Password."],
    minLength: [8, "Not less than 8 characters"],
    select: false, // it will not show to anyone while calling directly (find())
  },
  avatar: {
    public_id: { type: String, required: true },

    url: { type: String, required: true },
  },
  role: {
    type: String,
    default: "user",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

//Generating reset password token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(21).toString("hex");
  // Hashing and adding resetpasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};
module.exports = mongoose.model("User", userSchema);
