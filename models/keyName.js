const mongoose = require("mongoose");

// Schéma interne pour Key-Value
const keyNameSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});
const KeyName = mongoose.model("KeyName", keyNameSchema);

module.exports = { keyNameSchema, KeyName };
