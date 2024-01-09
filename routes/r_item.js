// import { myprint } from "../util/util";
const Util = require("../util/util");

var express = require("express");
var router = express.Router();

const Item = require("../models/m_item");

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
router.get("/", async (req, res) => {
  // For now, just send the fist board found in the database.
  Util.msg("GET item (no params)...", 35);

  try {
    const items = await City.find({}).exec();
    res.json(items);
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
  console.log("In route item/POST");

  var jsonArray = req.body;
  console.log("------------------- POST --------------------");
  console.log(req.body);

  for (var i = 0; i < jsonArray.length; i++) {
    var item = jsonArray[i];

    const newItem = new Item({
      name: item.name,
      type: item.type,
      location: item.location,
      sublocation: item.sublocation,
      quantity: item.quantity ? item.quantity : -1,
    });

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
          errorMsg: "While accessing MongoDB Database",
        });
      });
  }
});

module.exports = router;
