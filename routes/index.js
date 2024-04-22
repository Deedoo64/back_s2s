var express = require("express");
const fs = require("fs");

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("home page reached !");
  res.render("index", { title: "Express 3" });
});

router.get("/version", function (req, res, next) {
  var version = "1.1";
  console.log(`GET /version : ${version}`);
  res.json({ result: true, version: version });
});

router.get("/buildDate", function (req, res, next) {
  try {
    const data = fs.readFileSync("./build-info.json", "utf8");
    const jsonData = JSON.parse(data); // Parse the JSON string into an object

    res.json({ result: true, buildDate: jsonData.buildDate });
  } catch (err) {
    console.error("Error reading build info:", err);
    res.json({ result: false, version: "Unavailable" });
  }
});

module.exports = router;
