// import { myprint } from "../util/util";
const Util = require("../util/util");

var express = require("express");
var router = express.Router();

const Item = require("../models/m_item");
const Storage = require("../models/storage");
const { Unit } = require("../models/unit");

// Create route to delete a Board

// curl http://localhost:3000/board/toto # Where toto is the board name
// router.get("/:name", async (req, res) => {
//   var name = req.params.name;
//   Util.msg(` =============== GET board for name: ${name}`, 34);
//   // await Util.sleep(3000, "Wait 3 sec ...");

//   Board.findOne({ name: name })
//     .then((data) => {
//       if (data) {
//         res.json({ result: true, board: data });
//       } else {
//         var msg = `No board with name ${name} found in DB.`;
//         Util.error(msg);
//         res.json({
//           result: false,
//           errorMsg: msg,
//         });
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//       res.json({ result: false, errorMsg: "While accessing MongoDB Database" });
//     });
// });

// router.get("/:nickname", (req, res) => {
//   Util.print(` =============== GETAAA name: ${req.params.nickname}`, 34);
// });

// /* GET board listing. */
router.get("/:id", async (req, res) => {
  // For now, just send the fist board found in the database.
  const userId = req.params.id;

  console.log("In route item/GET");
  Util.msg(`GET item (with userId : ${userId})...`, 35);

  try {
    const items = await Item.find({ userId: userId }).exec();
    // for (let i = 0; i < items.length; i++) {
    //   item = items[i];
    //   item.name = item.name + " - COMMIT";
    // }
    res.json({ result: true, items });
    console.log("Found %d items", items.length);
  } catch (e) {
    Util.error(e);
    res.status(500).json(e);
  }
});

// 192.168.1.49.3001/items/all/65ba1b89190fc47a58838d6e

router.get("/all/:id", async (req, res) => {
  console.log("Did : In route item/all/GET : req : ", req.params);
  const userId = req.params.id;

  if (!userId) {
    res.json({ result: false, errorMsg: "User id is mandatory" });
  }

  console.log("req.query.id : ", userId);

  try {
    let items;
    console.log(`Look for all items of user : ${userId}`);
    items = await Item.find({ userId: userId })
      .populate("storageId")
      // .populate({
      //   path: "unitId",
      //   model: Unit, // Assurez-vous que c'est le nom du modèle comme enregistré
      //   select: "_id name", // Sélection des champs que vous voulez inclure
      // })
      // .populate({
      //   path: "unitId",
      //   // select: "name description", // Spécifiez les champs nécessaires pour Unit
      //   // populate: {
      //   //   path: "unitId",
      //   //   select: "name quantity", // Spécifiez les champs nécessaires pour les unités
      //   // },
      // })
      .exec();

    console.log("Found %d items", items.length);

    let json = "";
    json += "[\n";

    items.forEach((item) => {
      let storageName = item.storageId ? item.storageId.name : "";
      let storageId = item.storageId ? item.storageId._id : "";
      let unitName = item.unitId ? item.unitId.name : "";
      let unitId = item.unitId ? item.unitId._id : "";
      if (storageId != "" && unitId != "") {
        storageId = "";
      }
      let store = "null";
      let storeType = "storageId";
      if (storageId != "") {
        store = `"${storageId}"`;
        storeType = "storageId";
      }
      if (unitId != "") {
        store = `"${unitId}"`;
        storeType = "unitId";
      }

      // console.log("unit name : ", unitName, "unit id : ", item.unitId);

      console.log(
        `ID: ${item._id}, ${store}, ${item.name} (${item.type.name})`
      );

      json += `   { "itemId": "${item._id}", "name": "${item.name}", "type": "${item.type.name}", "${storeType}" : ${store}, \n`;

      // console.log(
      //   `${item.name} (${item.type.name}): ${
      //     item.storageId ? item.storageId.name : ""
      //   } ${
      //     item.unitId ? `- Unit ${item.unitId.name}: ${item.units[0].name}` : ""
      //   }`
      // );
    });

    json += "]\n";

    console.log(json);
    res.json({ result: true, items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, errorMsg: error.message });
  }
});

// // GET the board
// router.get("/all", async (req, res) => {
//   try {
//     const boards = await Board.find({}).exec();
//     res.json(boards);
//   } catch (e) {
//     res.status(500).json(e);
//   }
// });

router.post("/", (req, res) => {
  console.log("In route item/POST");

  // return res.status(500).json({
  //   result: false,
  //   errorMsg: "Simulate error in POST item",
  // });

  var item = req.body;
  console.log("------------------- POST --------------------");
  console.log(item);

  console.log("Save item connected to User : ", item.userId);

  const newItem = new Item({
    name: item.name,
    type: item.type,
    userId: item.userId,
    storageId: item.storageId,
    comment: item.comment,
    unitId: item.unitId,
    quantity: item.quantity ? item.quantity : null,
    unitNb: item.unitNb ? item.unitNb : -1,
    entryDate: item.entryDate,
    expirationPolicy: item.expirationPolicy ? item.expirationPolicy : "",
    customExpirationDate: item.customExpirationDate
      ? item.customExpirationDate
      : null,
    customExpirationDuration: item.customExpirationDuration
      ? item.customExpirationDuration
      : 0,
  });

  console.log("Just before to save ...");

  console.log("");

  Item.validate(newItem)
    .then((validatedObject) => {
      console.log("Objet valide :", validatedObject);

      newItem
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

// router.put("/:id", async (req, res) => {
//   console.log("In route item/PUT");

//   const itemId = req.params.id;
//   const updates = req.body;

//   // return res.json({ result: false, errorMsg: "Fausse erreur." });

//   console.log("------------------- PUT --------------------");
//   console.log(`Update item ${itemId} with:`, updates);

//   try {
//     const item = await Item.findById(itemId).exec();

//     if (!item) {
//       console.log(`Item with ID ${itemId} not found.`);
//       return res.status(404).json({
//         result: false,
//         errorMsg: `Item with ID ${itemId} not found.`,
//       });
//     }

//     // Mise à jour de l'item avec les données fournies dans le corps de la requête
//     Object.keys(updates).forEach((update) => (item[update] = updates[update]));

//     await item.save();

//     console.log("\u001b[33mItem updated successfully! \u001b[0m");
//     res.json({ result: true, data: item });
//   } catch (error) {
//     console.log("============ START ERROR ====================");
//     console.error(error);
//     console.log("===============END ERROR =================");
//     const errorMessage = error.message ? error.message : "An error occurred";

//     res.status(500).json({
//       result: false,
//       errorMsg: errorMessage,
//     });
//   }
// });

router.put("/:id", async (req, res) => {
  console.log("In route PUT /item");
  console.log("res.body : ", req.body);

  const itemId = req.params.id;
  const updates = req.body;

  if (!itemId) {
    return res.status(500).json({
      result: false,
      errorMsg: `Missing ID in route PUT.`,
    });
  }

  try {
    const item = await Item.findById(itemId).exec(); // Assurez-vous que l'index est utilisé ici.

    if (!item) {
      console.log(`Item with ID ${itemId} not found.`);
      return res.status(500).json({
        result: false,
        errorMsg: `Item with ID ${itemId} not found.`,
      });
    }

    // Appliquer la mise à jour sans recharger l'objet complet en mémoire
    const result = await Item.updateOne({ _id: itemId }, { $set: updates });

    console.log("Item updated successfully!");
    res.json({ result: true, data: result });
  } catch (error) {
    console.error("An error occurred", error);
    res.status(500).json({
      result: false,
      errorMsg: error.message || "An error occurred",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const itemId = req.params.id;

  console.log(`In route DELETE /item with itemId: ${itemId}`);
  if (itemId === undefined || itemId === null || itemId === "") {
    res.status(500).json({
      result: false,
      errorMsg: "Missing item ID in route DELETE.",
    });

    return;
  }

  try {
    const item = await Item.findByIdAndRemove(itemId);

    // Vérifiez si l'item a été trouvé
    if (!item) {
      console.log(`Item with ID ${itemId} not found.`);
      return res.status(500).json({
        result: false,
        errorMsg: `Item with ID ${itemId} not found.`,
      });
    }
    console.log(`Item with ID ${itemId} successfully deleted.`);
    res.json({
      result: true,
      data: item,
    });
  } catch (error) {
    console.error(`Error while deleting item with ID ${itemId}: `, error);
    const errorMessage = error.message ? error.message : "An error occurred";
    res.status(500).json({
      result: false,
      errorMsg: errorMessage,
    });
  }
});

router.delete("/", async (req, res) => {
  var itemsIds = req.body;
  console.log("In route DELETE /items with itemsIds: ", itemsIds);

  if (!itemsIds || itemsIds.length === 0) {
    return res.status(400).json({
      result: false,
      errorMsg: "No item IDs provided.",
    });
  }

  try {
    const deletionResult = await Item.deleteMany({
      _id: { $in: itemsIds },
    });

    if (deletionResult.deletedCount === 0) {
      return res.status(500).json({
        result: false,
        errorMsg: "No items found with the provided IDs.",
      });
    }
    console.log(`${deletionResult.deletedCount} items successfully deleted.`);
    res.status(200).json({ result: true, data: deletionResult.deletedCount });
  } catch (error) {
    console.error("Error deleting items: ", error);
    res.status(500).json({
      result: false,
      errorMsg: "An error occurred while deleting items.",
    });
  }
});

// Route PATCH pour mettre à jour un document Storage
router.patch("/updateStorage", async (req, res) => {
  const { ids, storageId, unitId } = req.body;

  console.log("For all items with ids: ", ids);
  console.log("Update storageId: ", storageId);
  console.log("Update unitId: ", unitId);
});
module.exports = router;
