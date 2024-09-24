const mongoose = require("mongoose");

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

const Quantity = mongoose.model("Quantity", quantitySchema);

module.exports = { quantitySchema, Quantity };
