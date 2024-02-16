const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  nickname: String,
  email: String,
  password: String,
  token: String,
  autoLogin: Boolean,
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
