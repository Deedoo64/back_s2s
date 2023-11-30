// import { myprint } from "../util/util";
const Util = require("../util/util");

var express = require("express");
var router = express.Router();

const Board = require("../models/m_board");

// curl http://localhost:3000/board/toto # Where toto is the board name
router.get("/:name", async (req, res) => {
  var name = req.params.name;
  Util.msg(` =============== GET board for name: ${name}`, 34);
  Board.findOne({ name: name })
    .then((data) => {
      if (data) {
        res.json({ result: true, board: data });
      } else {
        var msg = `No board with name ${name} found in DB.`;
        Util.error(msg);
        res.json({
          result: false,
          errorMsg: msg,
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.json({ result: false, error: "While accessing MongoDB Database" });
    });
});

// router.get("/:nickname", (req, res) => {
//   Util.print(` =============== GETAAA name: ${req.params.nickname}`, 34);
// });

// /* GET board listing. */
router.get("/", async (req, res) => {
  // For now, just send the fist board found in the database.
  Util.msg("GET (no params)...", 35);
  try {
    const board = await Board.findOne({}).exec();
    res.json(board);
  } catch (e) {
    console.log(e);
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
  console.log("In route POST");
  const newBoard = new Board({
    name: req.body.name,
    apps: req.body.apps,
  });

  newBoard
    .save()
    .then((data) => {
      console.log("\u001b[33mRequest succeed ! \u001b[0m");
      res.json({ result: true, board: data });
    })
    .catch((error) => {
      console.error(error);
      res.json({ result: false, error: "While accessing MongoDB Database" });
    });
});

module.exports = router;
