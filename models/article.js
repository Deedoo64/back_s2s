const mongoose = require("mongoose");

const { keyNameSchema } = require("./keyName"); // Importez spécifiquement le schéma
const { quantitySchema } = require("./quantity"); // Importez spécifiquement le schéma

const articleSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: false },
  quantity: { type: quantitySchema, required: false },
  done: Boolean,
});

const Article = mongoose.model("Article", articleSchema);

module.exports = { articleSchema, Article };
