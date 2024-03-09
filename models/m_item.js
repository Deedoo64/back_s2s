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
  location: { type: String, required: false },
  storageId: { type: mongoose.Schema.Types.ObjectId, ref: "storages" },
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "units" },
  quantity: { type: Number, required: true },
  entryDate: { type: Date, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Item = mongoose.model("items", itemSchema);

module.exports = Item;
