const mongoose = require("mongoose");
const { Schema } = mongoose;
const { keyNameSchema } = require("./keyName"); // Importez spécifiquement le schéma
const { quantitySchema } = require("./quantity");
// const { articleSchema } = require("./article");

// Schéma commun pour les items d'une liste
const checkEntryShema = new Schema({
  name: { type: String, required: true }, // Nom de l'article ou tâche
  done: { type: Boolean, default: false }, // Statut (pour checklist ou todo_list)
  due_date: { type: Date }, // Date limite (pour todo_list)
  priority: { type: String, enum: ["low", "medium", "high"] }, // Priorité (pour todo_list)
});

// Schéma commun pour les items d'une liste
const taskEntrySchema = new Schema({
  name: { type: String, required: true }, // Nom de l'article ou tâche
  done: { type: Boolean, default: false }, // Statut (pour checklist ou todo_list)
  due_date: { type: Date }, // Date limite (pour todo_list)
  priority: { type: String, enum: ["low", "medium", "high"] }, // Priorité (pour todo_list)
  added_at: { type: Date, default: Date.now }, // Date d'ajout (pour shopping_list)
});

// Schéma pour les métriques/temps
const trackingEntrySchema = new Schema({
  date: { type: Date, required: true }, // Date de la mesure
  value: { type: Number, required: true }, // Valeur (ex : poids, durée)
  unit: { type: String }, // Unité de mesure (ex : kg, secondes)
});

const shoppingEntrySchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: false },
  quantity: { type: quantitySchema, required: false },
  unitNb: { type: Number, required: false },
  done: { type: Boolean, default: false },
});

// Schéma principal pour les différentes listes
const listSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

    type: {
      type: String,
      enum: ["shopping", "todo", "check", "tracking"],
      required: true,
    }, // Type de la liste
    name: { type: String, required: true }, // Nom de la liste
    private: { type: Boolean, default: false }, // Visibilité de la liste
    sortedBy: { type: String, default: "" }, // Tri un nom de champ
    // entries: [{ type: Schema.Types.Mixed }], // Allow any of Item, Tracking or Shopping schema
    checks: [checkEntryShema], // Pour shopping_list, todo_list, checklist
    tasks: [taskEntrySchema],
    trackings: [trackingEntrySchema], // Pour tracking_list
    shoppings: [shoppingEntrySchema],
  },
  { timestamps: true }
);

// Modèle Mongoose
const List = mongoose.model("List", listSchema);
// const ShoppingEntry = List.discriminator("ShoppingEntry", shoppingEntrySchema);
const ShoppingEntry = mongoose.model("ShoppingEntry", shoppingEntrySchema);
const TaskEntry = mongoose.model("TaskEntry", taskEntrySchema);
const TrackingEntry = mongoose.model("TrackingEntry", trackingEntrySchema);
const CheckEntry = mongoose.model("CheckEntry", checkEntryShema);

module.exports = { List, ShoppingEntry, TaskEntry, CheckEntry, TrackingEntry };
