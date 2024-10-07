// routes/shoppingLists.js
const Util = require("../util/util");
const { checkBody } = require("../modules/checkBody");

const express = require("express");
const router = express.Router();
const { List, ShoppingEntry } = require("../models/m_list");
const mongoose = require("mongoose");

//===============================================================
// GET /:userId : Route pour récupérer la liste des listes
//===============================================================
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Chercher toutes les listes de courses pour l'utilisateur
    let lists = await List.find({ userId: userId });
    console.log(`Found ${lists.length} lists for user ${userId}`);

    res.json({
      result: true,
      data: lists,
    });
  } catch (error) {
    return Util.catchError(
      res,
      error,
      `Error while getting shoppingList for userId ${userId}:`
    );
  }
});

//===============================================================
// POST : / Add a new list
//===============================================================
router.post("/", (req, res) => {
  // return res.status(500).json({
  //   result: false,
  //   errorMsg: "Simulate error in POST item",
  // });

  var listBody = req.body;
  console.log("------------------- POST list/------------------");
  console.log(listBody);

  const newList = new List(listBody);

  List.validate(newList)
    .then((validatedObject) => {
      console.log("Objet valide :", validatedObject);

      newList
        .save()
        .then((data) => {
          console.log("\u001b[33mRequest succeed ! \u001b[0m");
          console.log("res.jon : data : ", data);
          res.json({ result: true, data: data });
        })
        .catch((error) => {
          console.error(error);
          res.json({
            result: false,
            errorMsg: error.message ? error.message : "Error in MongoDB save",
          });
        });
    })
    .catch((validationError) => {
      console.error("Erreur de validation :", validationError.errors);
      res.json({
        result: false,
        errorMsg: "Item dooes not match the schema. " + validationError.errors,
      });
    });
});

//===============================================================
// PUT : /list Save an existing list
//===============================================================
router.put("/", async (req, res) => {
  // return res.status(500).json({
  //   result: false,
  //   errorMsg: "Simulate error in POST item",
  // });

  var listBody = req.body;
  console.log("------------------- PUT list/------------------");
  console.log(listBody);

  var id = req.body._id;
  try {
    const updatedList = await List.findByIdAndUpdate(
      id,
      listBody, // On utilise l'objet entier reçu
      { new: true, runValidators: true } // `new: true` pour retourner le document mis à jour
    );

    if (!updatedList) {
      return res.status(500).json({
        result: false,
        errorMsg: `Can not find list with id ${id}`,
      });
    }
    res.json({ result: true, data: updatedList });
  } catch (error) {
    console.error(error);
    res.json({
      result: false,
      errorMsg: error.message ? error.message : "Error in MongoDB save",
    });
  }

  // const newList = new List(listBody);

  // List.validate(newList)
  //   .then((validatedObject) => {
  //     console.log("Objet valide :", validatedObject);

  //     newList
  //       .save()
  //       .then((data) => {
  //         console.log("\u001b[33mRequest succeed ! \u001b[0m");
  //         console.log("res.jon : data : ", data);
  //         res.json({ result: true, data: data });
  //       })
  //       .catch((error) => {
  //         console.error(error);
  //         res.json({
  //           result: false,
  //           errorMsg: error.message ? error.message : "Error in MongoDB save",
  //         });
  //       });
  //   })
  //   .catch((validationError) => {
  //     console.error("Erreur de validation :", validationError.errors);
  //     res.json({
  //       result: false,
  //       errorMsg: "Item dooes not match the schema. " + validationError.errors,
  //     });
  //   });
});

//===============================================================
// POST : Route pour ajouter une liste d'articles à une shoppingList existante
//===============================================================
router.post("/entries", async (req, res) => {
  const { entries, listId } = req.body;
  console.log(
    " =========== POST /list/entries/ =========  in listId => ",
    listId
  );

  console.log("Entries to add : ", req.body.entries.length);

  console.log(req.body.entries);

  const checkStatus = checkBody(req.body, ["entries", "listId"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    // Utilisation de la fonction générique pour récupérer la liste et le nom du champ d'entrées
    const { list, FN } = await findListAndEntriesFieldName(listId);

    // console.log("List and entries found:", list, entriesFieldName);

    const entriesWithId = [];
    for (const entry of entries) {
      // Ajouter chaque entrée avec un nouvel ID généré par Mongoose
      const newEntry = { ...entry, _id: new mongoose.Types.ObjectId() };
      list[FN].push(newEntry); // Ajouter l'entrée dans le bon champ
      console.log("Add entry : \n", newEntry);
      entriesWithId.push(newEntry);
    }

    // Sauvegarder la liste avec les nouvelles entrées
    const savedList = await list.save();
    console.log("Saved list : ", savedList);
    console.log("New entries : ", entriesWithId);

    // Retourner la réponse avec les entrées ajoutées
    res.json({ result: true, data: entriesWithId });
  } catch (error) {
    return Util.catchError(res, error, "Error while adding entries to list");
  }
});

//===============================================================
// DEL : Route pour supprimer des entries d'une liste
//===============================================================
router.delete("/entries", async (req, res) => {
  const { listId, entriesIds } = req.body;

  const checkStatus = checkBody(req.body, ["listId", "entriesIds"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    // Obtenir la liste et le champ d'entrées correspondant au type
    let { list, FN } = await findListAndEntriesFieldName(listId);

    console.log("List and entries found:", list, FN);

    // Récupérer la longueur initiale du tableau d'entrées
    const initialCount = list[FN].length;

    // Filtrer les entrées à supprimer selon les IDs donnés
    list[FN] = list[FN].filter(
      (entry) => !entriesIds.includes(entry._id.toString())
    );

    // Sauvegarder la liste après suppression des entrées
    const savedList = await list.save();
    console.log("Saved List:", savedList);

    // Calculer le nombre d'entrées supprimées
    const deletedCount = initialCount - list[FN].length;
    console.log("Deleted count: ", deletedCount);

    // Retourner le résultat de la suppression
    res.json({ result: true, data: { deletedCount } });
  } catch (error) {
    return Util.catchError(res, error, `Error while deleting entries in list`);
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

//===============================================================
// PUT : Route pour mettre à jour une liste d'articles dans une shoppingList existante
//===============================================================
router.put("/entries", async (req, res) => {
  const { entries, listId } = req.body;
  console.log("in PUT /list/entries/   in listId => ", listId);

  const checkStatus = checkBody(req.body, ["entries", "listId"]);
  console.log("Entries", entries);

  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    // Utilisation de la fonction générique pour récupérer la liste et le champ des entrées
    const { list, FN } = await findListAndEntriesFieldName(listId);

    // Mettre à jour chaque entrée dans le champ d'entrées correspondant
    for (const updatedEntry of entries) {
      const index = list[FN].findIndex(
        (entry) => entry._id.toString() === updatedEntry._id
      );

      if (index !== -1) {
        // Mise à jour de l'entrée existante
        list[FN][index] = {
          ...list[FN][index],
          ...updatedEntry,
        };
      } else {
        // Si l'entrée n'existe pas encore, on l'ajoute
        list[FN].push({
          ...updatedEntry,
          _id: new mongoose.Types.ObjectId(),
        });
      }
    }

    // console.log("Real saved entries : ", entries);
    // Sauvegarder la liste avec les modifications
    await list.save();

    res.json({ result: true, data: entries });
  } catch (error) {
    return Util.catchError(res, error, `Error while updating entries in list`);
  }
});

// // Fonction pour récupérer la liste et ses entrées en fonction du type de liste
// //===============================================================
const findListAndEntriesFieldName = async (listId) => {
  try {
    // Rechercher la liste par son identifiant
    const list = await List.findById(listId).exec();

    if (!list) {
      throw new Error(`No list found with id ${listId}`);
    }

    let FN;

    // Vérifier le type de la liste et assigner la référence à la bonne propriété d'entrées
    switch (list.type) {
      case "shopping":
        FN = "shoppings"; // Récupérer les articles de la liste de courses
        break;
      case "task":
        FN = "tasks"; // Récupérer les tâches pour todo_list
        break;
      case "check":
        FN = "checks"; // Récupérer les items pour checklist
        break;
      case "tracking":
        FN = "trackings"; // Récupérer les entrées de suivi pour tracking list
        break;
      default:
        throw new Error(`Unknown list type ${list.type}`);
    }

    // Retourner la liste et le nom du champ d'entrées
    return { list, FN };
  } catch (error) {
    console.error("Error while getting entries:", error);
    throw error; // Relever l'erreur pour gestion en amont
  }
};
module.exports = router;
