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

// Schéma interne pour Key-Value
const quantitySchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
});

const itemSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: true },
  storageId: { type: mongoose.Schema.Types.ObjectId, ref: "Storage" },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit" },
  quantity: { type: quantitySchema, required: false },
  volume: { type: Number, required: false },
  volumeUnit: { type: String, required: false },
  unitNb: { type: Number, required: false },
  entryDate: { type: Date, required: true },
  expirationPolicy: { type: String, required: false },
  customExpirationDate: { type: Date, required: false },
  customExpirationDuration: { type: Number, required: false },
  comment: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

const Item = mongoose.model("items", itemSchema);

module.exports = Item;
