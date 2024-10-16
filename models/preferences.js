const mongoose = require("mongoose");

const preferencesSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  defaultShoppingListId: { type: mongoose.Schema.Types.ObjectId, ref: "List" },
});

const Preferences = mongoose.model("Preferences", preferencesSchema);

module.exports = Preferences;
