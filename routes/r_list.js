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

    // if (lists.length === 0) {
    //   // Si aucune liste n'est trouvée, créer une nouvelle liste par défaut
    //   const defaultShoppingList = new ShoppingList({
    //     name: "Default",
    //     userId: userId,
    //     note: "",
    //     articles: [],
    //   });

    //   await defaultShoppingList.save();
    //   lists.push(defaultShoppingList);
    // }

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
  console.log("In route item/POST");

  // return res.status(500).json({
  //   result: false,
  //   errorMsg: "Simulate error in POST item",
  // });

  var list = req.body;
  console.log("------------------- POST --------------------");
  console.log(list);

  console.log("Save list connected to User : ", list.userId);

  const newList = new List({
    name: list.name,
    type: list.type,
    userId: list.userId,
  });

  console.log("Just before to save ...");

  console.log("");

  List.validate(newList)
    .then((validatedObject) => {
      console.log("Objet valide :", validatedObject);

      newList
        .save()
        .then((data) => {
          console.log("\u001b[33mRequest succeed ! \u001b[0m");
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
// POST : Route pour ajouter une liste d'articles à une shoppingList existante
//===============================================================
router.post("/entries", async (req, res) => {
  const { entries, listId } = req.body; // Utilise "Default" comme valeur par défaut pour le nom
  console.log("in POST /list/entries/   in listId => ", listId);

  const checkStatus = checkBody(req.body, ["entries", "listId"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    const { list, entriesField } = await getListAndEntriesByListType(listId);

    console.log("List and entries found:", list, entriesField);
    // Enregistrer chaque article dans la base de données et récupérer l'ID généré
    // const entriesWithId = [];
    // for (const entry of entries) {
    //   console.log("Adding article : ", entry);
    //   const newShopping = { ...entry, _id: new mongoose.Types.ObjectId() };
    //   list.shoppings.push(newShopping);
    //   entriesWithId.push(newShopping);
    // }
    const entriesWithId = [];
    for (const entry of entries) {
      // Validation ici avec mongoose
      const newShopping = { ...entry, _id: new mongoose.Types.ObjectId() };
      entriesField.push(newShopping);
      entriesWithId.push(newShopping);
    }
    console.log("Before to save entries");
    // Sauvegarder les modifications
    await list.save();
    console.log("After to save entries");

    res.json({ result: true, data: entriesWithId }); // Ajouter la clé "data" avec le tableau "articlesWithIds"
  } catch (error) {
    return Util.catchError(res, error, "Error while adding entries to list");
  }
});
//===============================================================
// DEL : Route pour supprimer une liste de courses
//===============================================================
router.delete("/articles", async (req, res) => {
  //   return res
  //     .status(500)
  //     .json({ result: false, errorMsg: "Shopping list not found." });
  const { userId, articlesIds, name = "Default" } = req.body; // Utilise "Default" comme valeur par défaut pour le nom

  const checkStatus = checkBody(req.body, ["articlesIds", "userId", "name"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    const shoppingList = await ShoppingList.findOne({
      userId: userId,
      name: name,
    });

    if (!shoppingList) {
      return res
        .status(500)
        .json({ result: false, errorMsg: "Shopping list not found." });
    }

    // Supprimer les articles dont les ID se trouvent dans articlesIds
    shoppingList.articles = shoppingList.articles.filter(
      (article) => !articlesIds.includes(article._id.toString())
    );

    shoppingList.updated_at = new Date();

    // Save the changes
    await shoppingList.save();

    res.json({ result: true, data: shoppingList });
  } catch (error) {
    return Util.catchError(
      res,
      error,
      `Error while deleting shoppingList ${name} for userId ${userId}:`
    );
  }
});

//===============================================================
// PUT : Route pour mettre à jour une liste d'articles dans une shoppingList existante
//===============================================================
router.put("/entries", async (req, res) => {
  const { entries, listId } = req.body; // Utilise "Default" comme valeur par défaut pour le nom
  console.log("in PUT /list/entries/   in listId => ", listId);

  const checkStatus = checkBody(req.body, ["entries", "listId"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }
  try {
    // Chercher la liste de courses pour l'utilisateur
    const { list, entriesField } = await getListAndEntriesByListType(listId);

    // Mettre à jour chaque article dans la liste des articles
    for (updatedEntry of entries) {
      const index = entriesField.findIndex(
        (article) => article._id.toString() === updatedEntry._id
      );
      if (index !== -1) {
        entriesField[index] = {
          ...entriesField[index],
          ...updatedEntry,
        };
      } else {
        // Optionnel : Ajouter un nouvel article s'il n'existe pas déjà dans la liste
        entriesField.push({
          ...updatedEntry,
          _id: new mongoose.Types.ObjectId(),
        });
      }
    }

    // Sauvegarder les modifications
    await list.save();

    res.json({ result: true, data: entries });
  } catch (error) {
    return Util.catchError(res, error, `Error while updating entries in list`);
  }
});

// Fonction pour récupérer la liste et ses entrées en fonction du type de liste
const getListAndEntriesByListType = async (listId) => {
  try {
    // Rechercher la liste par son identifiant
    const list = await List.findById(listId).exec();

    if (!list) {
      throw new Error(`No list found with id ${listId}`);
    }

    let entriesField;

    // Vérifier le type de la liste et assigner les bonnes entrées
    switch (list.type) {
      case "shopping":
        entriesField = list.shoppings; // Récupérer les articles de la liste de courses
        break;
      case "todo":
        entriesField = list.tasks; // Récupérer les tâches pour todo_list
        break;
      case "check":
        entriesField = list.checks; // Récupérer les items pour checklist
        break;
      case "tracking":
        entriesField = list.trackings; // Récupérer les entrées de suivi pour tracking list
        break;
      default:
        throw new Error(`Unknown list type ${list.type}`);
    }

    // Retourner la liste et les entrées
    return { list, entriesField };
  } catch (error) {
    console.error("Error while getting entries:", error);
    throw error; // Relever l'erreur pour gestion en amont
  }
};

module.exports = router;
