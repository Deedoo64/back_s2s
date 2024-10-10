const express = require("express");
const router = express.Router();
const { List } = require("../models/m_list");

// Route pour mettre à jour les positions des entrées
router.put("/update-positions", async (req, res) => {
  try {
    // Récupère toutes les listes
    const lists = await List.find();

    for (const list of lists) {
      console.log("Updating list ", list.name);
      // Fonction pour mettre à jour les positions d'une liste d'entrées
      const updatePositions = (entries) => {
        if (entries && entries.length > 0) {
          // Trie les entrées par ordre alphabétique
          //   console.log(`Comparing ${a.name} and ${b.name}`);
          entries.sort((a, b) => {
            const nameA = a.name ? a.name.toLowerCase() : ""; // Définit un nom par défaut si undefined
            const nameB = b.name ? b.name.toLowerCase() : ""; // Définit un nom par défaut si undefined
            console.log(`Comparing ${nameA} and ${nameB}`);
            return nameA.localeCompare(nameB);
          }); // Met à jour les positions avec un incrément de 10
          entries.forEach((entry, index) => {
            entry.position = (index + 1.0) * 10.01;
          });
        }
      };

      // Mise à jour des positions pour chaque type d'entrée dans la liste
      updatePositions(list.checks);
      updatePositions(list.tasks);
      updatePositions(list.shoppings);
      updatePositions(list.trackings);

      // Sauvegarde la liste mise à jour
      await list.save();
    }

    res
      .status(200)
      .json({ message: "Positions updated successfully for all lists." });
  } catch (error) {
    console.error("Error updating positions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating positions." });
  }
});

router.put("/convert-positions", async (req, res) => {
  try {
    console.log("Connected to MongoDB");

    // Fonction pour mettre à jour les positions dans un sous-document
    const convertPositions = async (fieldName) => {
      await List.updateMany({ [`${fieldName}.position`]: { $exists: true } }, [
        {
          $set: {
            [fieldName]: {
              $map: {
                input: `$${fieldName}`,
                as: "item",
                in: {
                  $mergeObjects: [
                    "$$item",
                    { position: { $toDouble: "$$item.position" } },
                  ],
                },
              },
            },
          },
        },
      ]);
    };

    // Conversion des positions pour chaque type de sous-document
    await convertPositions("checks");
    await convertPositions("tasks");
    await convertPositions("shoppings");
    await convertPositions("trackings");

    console.log("Position conversion complete for all entries");

    res.status(200).json({ message: "Positions converted successfully." });
  } catch (error) {
    console.error("Error converting positions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while converting positions." });
  } finally {
    // Fermer la connexion à la base de données MongoDB
  }
});

module.exports = router;
