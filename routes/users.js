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
    console.error(error);
    console.log("Error during User registration");
    res.json({ result: false, error: "While accessing MongoDB Database" });
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
      console.error(error);
      res.json({ result: false, error: "While accessing MongoDB Database" });
    });
});

module.exports = router;
