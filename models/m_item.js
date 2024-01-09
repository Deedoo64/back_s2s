const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  sublocation: { type: String, required: false },
  quantity: { type: Number, required: true },
});

const Item = mongoose.model("items", itemSchema);

module.exports = Item;
