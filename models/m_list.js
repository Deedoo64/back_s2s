const mongoose = require("mongoose");
const { Schema } = mongoose;
const { keyNameSchema } = require("./keyName"); // Importez spécifiquement le schéma
const { quantitySchema } = require("./quantity");
// const { articleSchema } = require("./article");

const alertSchema = new Schema({
  delayBefore: { type: Number, required: false },
  message: { type: String, required: false },
  snooze: { type: Number, required: false },
  flutterNotifId: { type: String, required: false },
});

// Schéma commun pour les items d'une liste
const checkEntryShema = new Schema({
  name: { type: String, required: true }, // Nom de l'article ou tâche
  done: { type: Boolean, default: false }, // Statut (pour checklist ou task_list)
  dueDate: { type: Date }, // Date limite (pour task_list)
  position: { type: Number, required: true }, // To save entry position in manual sort
  priority: { type: String, enum: ["low", "medium", "high"] },
});

// Schéma commun pour les items d'une liste
const taskEntrySchema = new Schema({
  name: { type: String, required: true }, // Nom de l'article ou tâche
  description: { type: String, required: false },
  done: { type: Boolean, default: false }, // Statut (pour checklist ou task_list)
  dueDate: { type: Date }, // Date limite (pour task_list)
  position: { type: Number, required: false }, // To save entry position in manual sort
  priority: { type: String, enum: ["low", "medium", "high"] }, // Priorité (pour task_list)
  alerts: [alertSchema],
  added_at: { type: Date, default: Date.now }, // Date d'ajout (pour shopping_list)
});

const trackingDefSchema = new Schema({
  name: { type: String, required: false },
  type: { type: String, enum: ["integer", "floating", "boolean"] }, // Sync with frontend TrackingType
  unit: { type: String },
  ref: { type: String, enum: ["date", "dateAndTime", "number"] },
});
// Schéma pour les métriques/temps
const trackingEntrySchema = new Schema({
  date: { type: Date, required: true }, // Date de l'entrée
  value: { type: mongoose.Schema.Types.Mixed }, // Valeur (nombre, texte, date, etc.)
  done: { type: Boolean, default: true },
});

const shoppingEntrySchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: keyNameSchema, required: false },
  quantity: { type: quantitySchema, required: false },
  unitNb: { type: Number, required: false },
  position: { type: Number, required: true }, // To save entry position in manual sort
  done: { type: Boolean, default: false },
});

// Schéma principal pour les différentes listes
const listSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },

    type: {
      type: String,
      enum: ["shopping", "task", "check", "tracking"],
      required: true,
    }, // Type de la liste
    note: { type: String, required: false },
    addToAutocomplete: { type: Boolean, required: false, default: true },
    name: { type: String, required: true }, // Nom de la liste
    private: { type: Boolean, default: false }, // Visibilité de la liste
    sortedBy: { type: String, default: "" }, // Tri un nom de champ
    trackingDef: { type: trackingDefSchema, required: false },
    checks: [checkEntryShema], // Pour shopping_list, task_list, checklist
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
