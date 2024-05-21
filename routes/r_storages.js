// import { myprint } from "../util/util";
const Util = require("../util/util");

var express = require("express");
var router = express.Router();

const Storage = require("../models/storage");

// /* GET board listing. */
router.get("/:id", async (req, res) => {
  // For now, just send the fist board found in the database.
  const userId = req.params.id;

  console.log("In route storage/GET");
  Util.msg(`GET storage (with userId : ${userId})...`, 35);

  try {
    const storages = await Storage.find({ userId: userId }).exec();
    res.json({ result: true, storages });
    console.log("Found %d storages", storages.length);
  } catch (e) {
    Util.error(e);
    res.status(500).json(e);
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
  console.log("In route storage/POST");

  var storage = req.body;
  console.log("------------------- POST --------------------");
  console.log(storage);

  Util.msg("Save storage connected to User : ", storage.userId, 33);

  const newStorage = new Storage({
    name: storage.name,
    type: storage.type,
    userId: storage.userId,
    location: storage.location,
    color: storage.color,
    layout: storage.layout,
    note: storage.note,
  });

  console.log("Just before to save ...");

  Storage.validate(newStorage)
    .then((validatedObject) => {
      console.log("Objet valide :", validatedObject);

      newStorage
        .save()
        .then((data) => {
          console.log("\u001b[33mRequest succeed ! \u001b[0m");
          res.json({ result: true, data: data });
        })
        .catch((error) => {
          console.error(error);
          const errorMessage = error.message
            ? error.message
            : "in storage validation";
          res.json({
            result: false,
            errorMsg: errorMessage,
          });
        });
    })
    .catch((validationError) => {
      console.error("Erreur de validation :", validationError.errors);
      res.json({
        result: false,
        errorMsg: "Storage dooes not match the schema",
      });
    });
});

router.post("/", (req, res) => {
  console.log("In route item/POST");
});

// Route PATCH pour mettre à jour un document Storage
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, type, color, location, layout, note } = req.body;

  console.log("In route storage/PATCH ...");

  try {
    // Assurez-vous d'inclure l'orientation du layout en utilisant la notation pointée pour les sous-documents
    const updateObject = {
      ...(name && { name }),
      ...(type && { type }),
      ...(color && { color }),
      ...(location && { location }),
      ...(note && { note }),
      ...(layout && { "layout.orientation": layout.orientation }), // Mise à jour de l'orientation du layout
    };

    // Affiche l'orientation
    console.log("Orientation :", layout.orientation);
    const updatedStorage = await Storage.findByIdAndUpdate(
      id,
      { $set: updateObject },
      { new: true, runValidators: true, context: "query" } // Retourne le document mis à jour et assure l'exécution des validateurs
    );

    if (!updatedStorage) {
      return res
        .status(500)
        .json({ result: false, errorMsg: `Storage with ID ${id} not found.` });
    }

    res.json({ result: true, data: updatedStorage });
  } catch (error) {
    res.status(400).json({ result: false, errorMsg: error });
  }
});

router.delete("/:id", async (req, res) => {
  const storageId = req.params.id;

  console.log(`In route storages/DELETE with storage_id: ${storageId}`);

  try {
    const storage = await Storage.findByIdAndRemove(storageId);

    // Vérifiez si l'item a été trouvé
    if (!storage) {
      console.log(`Storage with ID ${storageId} not found.`);
      return res.status(500).json({
        result: false,
        errorMsg: `Storage with ID ${storageId} not found.`,
      });
    }
    console.log(`Item with ID ${storageId} successfully deleted.`);
    res.json({
      result: true,
      data: storage,
    });
  } catch (error) {
    console.error();
    res.status(500).json({
      result: false,
      errorMsg: `Error while deleting Storage with ID ${storageId}: `,
      error,
    });
  }
});
module.exports = router;
