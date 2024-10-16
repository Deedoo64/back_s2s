// routes/shoppingLists.js
const Preferences = require("../models/preferences");
const Util = require("../util/util");
const { checkBody } = require("../modules/checkBody");

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//===============================================================
// GET /:userId : Route pour récupérer toutes les liste du user
//===============================================================
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Chercher toutes les listes de courses pour l'utilisateur
    let preferences = await Preferences.findOne({ userId: userId });
    console.log(`Found preferences for user ${userId}`);
    if (!preferences) {
      // Si aucune liste n'est trouvée, créer une nouvelle liste par défaut
      preferences = new Preferences({
        userId: userId,
        defaultShoppingListId: null,
      });

      await preferences.save();
    }

    res.json({
      result: true,
      data: preferences,
    });
  } catch (error) {
    return Util.catchError(
      res,
      error,
      `Error while getting Preferences for userId ${userId}:`
    );
  }
});

// //===============================================================
// // POST : / Add a new list
// //===============================================================
// router.post("/", (req, res) => {
//   // return res.status(500).json({
//   //   result: false,
//   //   errorMsg: "Simulate error in POST item",
//   // });

//   var listBody = req.body;
//   console.log("------------------- POST list/------------------");
//   console.log(listBody);

//   const newList = new List(listBody);

//   List.validate(newList)
//     .then((validatedObject) => {
//       console.log("Objet valide :", validatedObject);

//       newList
//         .save()
//         .then((data) => {
//           console.log("\u001b[33mRequest succeed ! \u001b[0m");
//           console.log("res.jon : data : ", data);
//           res.json({ result: true, data: data });
//         })
//         .catch((error) => {
//           console.error(error);
//           res.json({
//             result: false,
//             errorMsg: error.message ? error.message : "Error in MongoDB save",
//           });
//         });
//     })
//     .catch((validationError) => {
//       console.error("Erreur de validation :", validationError.errors);
//       res.json({
//         result: false,
//         errorMsg: "Item dooes not match the schema. " + validationError.errors,
//       });
//     });
// });

//===============================================================
// PUT : /list Save an existing list
//===============================================================
router.put("/:userId", async (req, res) => {
  const userId = req.params.userId;
  const prefBody = req.body;

  console.log("------------------- PUT /preferences/------------------");
  console.log(prefBody);

  try {
    // Met à jour les préférences pour un utilisateur spécifique
    const updatedPrefs = await Preferences.findOneAndUpdate(
      { userId: userId }, // Filtre basé sur userId
      prefBody, // Données à mettre à jour
      { new: true, runValidators: true, upsert: true } // `new: true` retourne le document mis à jour, `upsert: true` crée l'entrée si elle n'existe pas
    );

    if (!updatedPrefs) {
      return res.status(404).json({
        result: false,
        errorMsg: `Cannot find preferences for userId ${userId}`,
      });
    }

    // Retourne les préférences mises à jour
    res.json({ result: true, data: updatedPrefs });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      result: false,
      errorMsg: error.message ? error.message : "Error in MongoDB update",
    });
  }
});

//===============================================================
// DEL : Route pour supprimer une liste de courses
//===============================================================
router.delete("/:listId", async (req, res) => {
  const listId = req.params.listId;

  console.log("About to delete list with id : ", listId);

  try {
    const list = await List.findById(listId);

    if (!list) {
      // La liste n'existe pas
      return res.json({
        result: false,
        errorMsg: `List with id ${listId} not found`,
      });
    }

    // 2. Supprimer la liste de courses
    const result = await List.deleteOne({ _id: listId });

    if (result.deletedCount === 0) {
      // Aucune suppression n'a eu lieu, cela signifie que la liste n'existe plus
      return res.json({
        result: false,
        errorMsg: `List with id ${listId} could not be deleted`,
      });
    }

    // 3. Retourner la liste supprimée
    res.json({ result: true, data: list });
  } catch (error) {
    return Util.catchError(res, error, `Error while deleting list ${listId}`);
  }
});

module.exports = router;
