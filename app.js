require("dotenv").config();

console.log("Starting my server ...");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var itemsRouter = require("./routes/r_item");
var storagesRouter = require("./routes/r_storages");
var utilRouter = require("./routes/util");
var preferencesRouter = require("./routes/r_preferences");

var listRouter = require("./routes/r_list");
var shoppingListRouter = require("./routes/shoppingList");

const port = 3001;

var app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/storages", storagesRouter);
app.use("/shoppingList", shoppingListRouter);
app.use("/list", listRouter);
app.use("/util", utilRouter);
app.use("/preferences", preferencesRouter);

console.log(`Server running on port ${port} ...`);
app.listen(port);

module.exports = app;

require("./models/connection");
