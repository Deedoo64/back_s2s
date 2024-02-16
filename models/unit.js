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

const unitSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: true },
});

const Unit = mongoose.model("Unit", unitSchema);

module.exports = { Unit, unitSchema };
