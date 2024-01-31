const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  token: String,
  autoLogin: Boolean,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
