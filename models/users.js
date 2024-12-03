const mongoose = require("mongoose");

// Définir le schéma ia séparément
const iaSchema = mongoose.Schema({
  requestDoneNb: Number,
  tokensUsed: Number,
  lastTokenUsedDate: Date,
});

const subscriptionSchema = mongoose.Schema({
  plan: {
    type: String,
    enum: ["Free", "Silver", "Gold", "Unset"],
    default: "Free",
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  purchaseToken: String,
  productId: String,
});

const userSchema = mongoose.Schema(
  {
    nickname: String,
    email: String,
    password: String,
    token: String,
    firebaseUID: String, // For user Google, Facebook or Anonyme
    tokenList: String, // Used to store list password
    resetCode: String, // Reset code send by email to reset tokenList (for private list)
    ia: iaSchema,
    subscription: subscriptionSchema,
    source: {
      type: String,
      enum: ["Google", "Facebook", "Anonymous", "Email"], // Make consistent with UserSource in front-end
      default: "Email",
    },
  },
  { timestamps: true }
); // Active les timestamps pour les nouvelles entrées

const User = mongoose.model("Users", userSchema);

module.exports = User;
