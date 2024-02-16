const mongoose = require("mongoose");
const { layoutSchema } = require("./layout"); // Importez spécifiquement le schéma

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

const storageSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: false },
  location: { type: String, required: false },
  color: { type: Number, required: false },
  layout: layoutSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Storage = mongoose.model("Storage", storageSchema);

module.exports = Storage;
