const mongoose = require("mongoose");
const { Schema } = mongoose;

// Schéma pour un élément favori stocké une seule fois
const favoriteSchema = new Schema({
  shoppingId: { type: String, required: true }, // Nom du favori
  description: { type: String }, // Description ou autres champs
});

// Modèle Mongoose pour l'élément favori
const Favorite = mongoose.model("Favorite", favoriteSchema);
