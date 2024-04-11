var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/version", function (req, res, next) {
  var version = "1.1";
  console.log(`GET /version : ${version}`);
  res.json({ result: true, version: version });
});

module.exports = router;
