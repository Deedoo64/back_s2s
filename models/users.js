const mongoose = require("mongoose");

// Définir le schéma ia séparément
const iaSchema = mongoose.Schema({
  requestDoneNb: Number,
  tokensUsed: Number,
  lastTokenUsedDate: Date,
});

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  nickname: String,
  email: String,
  password: String,
  token: String,
  autoLogin: Boolean,
  ia: iaSchema,
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
