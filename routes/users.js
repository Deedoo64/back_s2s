var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//===============================================================
// POST : signup
//===============================================================
router.post("/signup", async (req, res) => {
  console.log("/signup : req.body : ", req.body);
  const checkStatus = checkBody(req.body, ["nickname", "email", "password"]);
  if (!checkStatus.status) {
    console.log("1 : checkStatus.error : ", checkStatus.error);
    res.json({ result: false, error: checkStatus.error });
    return;
  }
  const { nickname, email, password, firstname, lastname } = req.body;

  try {
    const nicknameExists = await User.findOne({ nickname: nickname });
    if (nicknameExists) {
      console.log("2 : data != null");
      res.json({ result: false, error: "Nickname already exists" });
      return;
    }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      console.log("3 : data != null");
      res.json({ result: false, error: "Email already exists" });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      nickname: nickname,
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hash,
      token: uid2(32),
      autoLogin: false,
    });

    const savedUser = await newUser.save();
    console.log("4 : save");
    res.json({ result: true, user: savedUser });
  } catch (error) {
    console.error(error);
    console.log("Error during User registration");
    const errorMessage = error.message ? error.message : "in registration";

    res.json({ result: false, error: errorMessage });
  }
});

//===============================================================
// POST : signin
//===============================================================
router.post("/signin", (req, res) => {
  const checkStatus = checkBody(req.body, ["email", "password"]);
  if (!checkStatus.status) {
    res.json({ result: false, error: checkStatus.error });
    return;
  }

  User.findOne({
    email: req.body.email,
  })
    .then((user) => {
      if (!user) {
        res.json({ result: false, error: "Email not found" });
        return;
      }

      if (!bcrypt.compareSync(req.body.password, user.password)) {
        res.json({ result: false, error: "Wrong password" });
        return;
      }

      console.log("user : ", user);
      res.json({ result: true, user });
    })
    .catch((error) => {
      const errorMessage = error.message ? error.message : "in signin";
      console.error(error);
      res.json({ result: false, error: errorMessage });
    });
});

//===============================================================
// POST : signup
//===============================================================
router.post("/signup", async (req, res) => {
  console.log("/signup : req.body : ", req.body);
  const checkStatus = checkBody(req.body, ["nickname", "email", "password"]);
  if (!checkStatus.status) {
    console.log("1 : checkStatus.error : ", checkStatus.error);
    res.json({ result: false, error: checkStatus.error });
    return;
  }
  const { nickname, email, password } = req.body;

  try {
    const nicknameExists = await User.findOne({ nickname: nickname });
    if (nicknameExists) {
      console.log("2 : data != null");
      res.json({ result: false, error: "Nickname already exists" });
      return;
    }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      console.log("3 : data != null");
      res.json({ result: false, error: "Email already exists" });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      nickname: nickname,
      email: email,
      password: hash,
      token: uid2(32),
      autoLogin: false,
    });

    const savedUser = await newUser.save();
    console.log("4 : save");
    res.json({ result: true, user: savedUser });
  } catch (error) {
    const errorMessage = error.message ? error.message : "in signup";
    console.error(error);
    console.log("Error during User registration");
    res.json({ result: false, error: errorMessage });
  }
});

//===============================================================
// PUT : /update
//===============================================================
router.put("/update/:id", async (req, res) => {
  // console.log(`/update/${req.params.id} : ${req.body}`);
  try {
    const userId = req.params.id;
    const { firstname, lastname } = req.body;

    console.log("userId : ", userId);
    console.log("firstname : ", firstname);
    console.log("lastname : ", lastname);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstname, lastname },
      { new: true } // Cette option renvoie l'utilisateur mis à jour
    );

    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).send("Erreur lors de la mise à jour de l'utilisateur");
  }
});

module.exports = router;
