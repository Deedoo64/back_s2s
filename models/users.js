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
    enum: ["Free", "Silver", "Gold"],
    default: "Free",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
});

const userSchema = mongoose.Schema({
  nickname: String,
  email: String,
  password: String,
  token: String,
  firebaseUID: String, // For user Google, Facebook or Anonyme
  ia: iaSchema,
  subscription: subscriptionSchema,
  source: {
    type: String,
    enum: ["Google", "Facebook", "Anonymous", "Email"], // Make consistent with UserSource in front-end
    default: "Email",
  },
  plan: {
    type: String,
    enum: ["free", "silver", "gold"],
    default: "free",
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
