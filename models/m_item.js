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

const itemSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: true },
  storageId: { type: mongoose.Schema.Types.ObjectId, ref: "storages" },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "units" },
  quantity: { type: Number, required: true },
  entryDate: { type: Date, required: true },
  expirationPolicy: { type: String, required: false },
  customExpirationDate: { type: Date, required: false },
  customExpirationDuration: { type: Number, required: false },
  comment: { type: String, required: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Item = mongoose.model("items", itemSchema);

module.exports = Item;
