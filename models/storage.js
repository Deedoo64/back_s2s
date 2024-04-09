const mongoose = require("mongoose");
const { layoutSchema } = require("./layout"); // Importez spécifiquement le schéma

const storageSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: false },
  location: { type: String, required: false },
  color: { type: Number, required: false },
  layout: layoutSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  note: { type: String, required: false },
});

const Storage = mongoose.model("Storage", storageSchema);

module.exports = Storage;
