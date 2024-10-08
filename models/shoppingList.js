const mongoose = require("mongoose");

// const { keyNameSchema } = require("./keyName"); // Importez spécifiquement le schéma
// const { quantitySchema } = require("./quantity"); // Importez spécifiquement le schéma

// const articleSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   type: { type: keyNameSchema, required: false },
//   quantity: { type: quantitySchema, required: false },
//   done: Boolean,
// });

const { articleSchema } = require("./article"); // Importez spécifiquement le schéma

const shoppingListSchema = mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  note: { type: String, required: false },
  articles: [articleSchema],
});

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);

module.exports = ShoppingList;
