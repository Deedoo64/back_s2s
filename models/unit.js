const mongoose = require("mongoose");

const unitSchema = mongoose.Schema({
  name: { type: String, required: true },
});

const Unit = mongoose.model("Unit", unitSchema);

module.exports = { Unit, unitSchema };
