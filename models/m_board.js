const mongoose = require("mongoose");

const boardSchema = mongoose.Schema({
  name: String,
  apps: [String],
});

const Board = mongoose.model("boards", boardSchema);

module.exports = Board;
