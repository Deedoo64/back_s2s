const mongoose = require("mongoose");

// Définir le schéma ia séparément
const iaSchema = mongoose.Schema({
  requestDoneNb: Number,
  tokensUsed: Number,
  lastTokenUsedDate: Date,
});

const subscriptionSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["free", "silver", "gold"],
    default: "free",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
});

const userSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  nickname: String,
  email: String,
  password: String,
  token: String,
  autoLogin: Boolean,
  firebaseUID: String, // For user Google, Facebook or Anonyme
  ia: iaSchema,
  subscription: subscriptionSchema,
  source: {
    type: String,
    enum: ["Google", "Facebook", "Anonymous", "Email"], // Make consistent with UserSource in front-end
    default: "Email",
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
