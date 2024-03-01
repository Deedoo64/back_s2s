const mongoose = require("mongoose");
const { unitSchema } = require("./unit"); // Importez le schéma Unit

const layoutSchema = mongoose.Schema({
  name: { type: String, required: true },
  orientation: {
    type: String,
    enum: ["horizontal", "vertical"],
    default: "vertical",
    required: true,
  },
  units: [unitSchema],
});

const Layout = mongoose.model("Layout", layoutSchema);

module.exports = { layoutSchema, Layout };
