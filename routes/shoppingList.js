// routes/shoppingLists.js
const Util = require("../util/util");
const { checkBody } = require("../modules/checkBody");

const express = require("express");
const router = express.Router();
const ShoppingList = require("../models/shoppingList");
const mongoose = require("mongoose");

//===============================================================
// GET /:userId : Route pour récupérer ou créer une shoppingList
//===============================================================
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Chercher toutes les listes de courses pour l'utilisateur
    let shoppingLists = await ShoppingList.find({ userId: userId });

    if (shoppingLists.length === 0) {
      // Si aucune liste n'est trouvée, créer une nouvelle liste par défaut
      const defaultShoppingList = new ShoppingList({
        name: "Default",
        userId: userId,
        note: "",
        articles: [],
      });

      await defaultShoppingList.save();
      shoppingLists.push(defaultShoppingList);
    }

    res.json({
      result: true,
      data: shoppingLists,
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
// POST : Route pour ajouter une liste d'articles à une shoppingList existante
//===============================================================
router.post("/articles", async (req, res) => {
  const { articles, userId, name = "Default" } = req.body; // Utilise "Default" comme valeur par défaut pour le nom
  console.log("in POST /shoppingList/:userId/articles => userId:", userId);

  const checkStatus = checkBody(req.body, ["articles", "userId", "name"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    // Chercher la liste de courses pour l'utilisateur
    let shoppingList = await ShoppingList.findOne({ userId: userId, name });
    if (!shoppingList) {
      shoppingList = new ShoppingList({
        name: name,
        userId: userId,
        note: "",
        articles: [],
      });
    }

    // Enregistrer chaque article dans la base de données et récupérer l'ID généré
    const articlesWithIds = [];
    for (const article of articles) {
      console.log("Adding article : ", article);
      const newArticle = { ...article, _id: new mongoose.Types.ObjectId() };
      shoppingList.articles.push(newArticle);
      articlesWithIds.push(newArticle);
    }

    // Sauvegarder les modifications
    await shoppingList.save();

    res.json({ result: true, data: articlesWithIds }); // Ajouter la clé "data" avec le tableau "articlesWithIds"
  } catch (error) {
    return Util.catchError(
      res,
      error,
      "Error while adding articles to shoppingList"
    );
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
router.put("/articles", async (req, res) => {
  const { articles, userId, name = "Default" } = req.body; // Utilise "Default" comme valeur par défaut pour le nom
  console.log("in PUT /shoppingList/articles => userId:", userId);

  const checkStatus = checkBody(req.body, ["articles", "userId", "name"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    // Chercher la liste de courses pour l'utilisateur
    let shoppingList = await ShoppingList.findOne({ userId: userId, name });
    if (!shoppingList) {
      return res.json({ result: false, errorMsg: "Shopping list not found." });
    }

    // Mettre à jour chaque article dans la liste des articles
    for (const updatedArticle of articles) {
      const index = shoppingList.articles.findIndex(
        (article) => article._id.toString() === updatedArticle._id
      );
      if (index !== -1) {
        shoppingList.articles[index] = {
          ...shoppingList.articles[index],
          ...updatedArticle,
        };
      } else {
        // Optionnel : Ajouter un nouvel article s'il n'existe pas déjà dans la liste
        shoppingList.articles.push({
          ...updatedArticle,
          _id: new mongoose.Types.ObjectId(),
        });
      }
    }

    // Sauvegarder les modifications
    await shoppingList.save();

    res.json({ result: true, data: shoppingList.articles });
  } catch (error) {
    return Util.catchError(
      res,
      error,
      "Error while updating articles in shoppingList"
    );
  }
});
module.exports = router;
