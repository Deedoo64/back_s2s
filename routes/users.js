var express = require("express");
var router = express.Router();

const Util = require("../util/util");
const User = require("../models/users");
const FirebaseAdmin = require("../modules/firebase");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

//===============================================================
// POST : signup
//===============================================================
router.post("/signup", async (req, res) => {
  console.log("/signup1 : req.body : ", req.body);
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
      source: "Email",
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
// GET : Get user info from its ID
//===============================================================
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  console.log("In route GET:/users/<id> : userId : ", userId);
  if (!userId) {
    res.json({
      result: false,
      error: "Missing userId in route GET:/users/<id>",
    });
    return;
  }

  try {
    const user = await User.findOne({ _id: userId })
      .select("-password -token")
      .exec();
    if (!user) {
      res.json({
        result: false,
        errorMsg: `User not found with id : ${userId}`,
      });

      return;
    }
    console.log("user : ", user);
    res.json({ result: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, errorMsg: error.message });
  }
});

//===============================================================
// GET : /fromFirebase : Retrieve user info from firebase user
//===============================================================
router.get("/fromFirebase/:firebaseUID", async (req, res) => {
  const firebaseUID = req.params.firebaseUID;

  console.log("In route GET : /users/fromFirebase");
  Util.msg(`GET item (with firebase id : ${firebaseUID})...`, 35);

  try {
    const user = await User.findOne({ firebaseUID: firebaseUID }).exec();
    if (!user) {
      res.json({
        result: false,
        error: `Can not find Firebase user with id : ${firebaseUID}`,
      });
      return;
    }
    console.log("Found user : ", user.email);
    res.json({ result: true, data: user });
  } catch (error) {
    const errorMessage = error.message
      ? error.message
      : "in loading Firebase user";
    console.error(error);
    res.json({ result: false, error: errorMessage });
    return;
  }
});

//===============================================================
// POST : /fromFirebase : Create a new user from Firebase user (Google, Facebook, etc.)
//===============================================================
router.post("/fromFirebase", async (req, res) => {
  console.log("/fromFirebase : req.body : ", req.body);
  const checkStatus = checkBody(req.body, ["id", "source"]);
  const { firebaseUID, displayName, email, source } = req.body;

  // Check if the user already exists from its id
  const existingUserWithId = await User.findOne({ firebaseUID: firebaseUID });
  if (existingUserWithId) {
    console.log("User already exists with extern id : ", firebaseUID);
    console.log("No need to create it again");
    res.json({ result: true, data: existingUserWithId });
    return;
  }

  try {
    const newUser = new User({
      firebaseUID: firebaseUID,
      nickname: displayName,
      email: email,
      source: source,
      autoLogin: false,
    });
    const savedUser = await newUser.save();
    res.json({ result: true, data: savedUser });
  } catch (error) {
    const errorMessage = error.message
      ? error.message
      : "in creating user from Firebase";
    console.error(error);
    res.json({ result: false, error: errorMessage });
    return;
  }
});

//===============================================================
// POST : /linkAnonymousToFirebase
// Link a Google or new Email/Password account to an anonymous account
//===============================================================
router.post("/linkAnonymousToFirebase", async (req, res) => {
  console.log("/linkAnonymousToFirebase : req.body : ", req.body);
  const checkStatus = checkBody(req.body, [
    "firebaseUID",
    "anonymousUID",
    "email",
    "source",
  ]);
  const { firebaseUID, anonymousUID, email, source } = req.body;
  // Check if an account with same firebaseUID already exists
  const existingUserWithFirebaseUID = await User.findOne({
    firebaseUID: firebaseUID,
  });
  if (existingUserWithFirebaseUID) {
    Util.error(
      `User  already ${existingUserWithFirebaseUID.email} exists with firebaseUID : `,
      firebaseUID
    );
    Util.error("It can not be associted to an anonymous user");
    res.json({
      result: false,
      errorMsg: `Account ${existingUserWithFirebaseUID.email}  has already been associated with an anonymous account`,
    });
    return;
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: anonymousUID },
      {
        firebaseUID: firebaseUID,
        email: email,
        source: source,
      },
      { new: true } // Cette option renvoie le document mis à jour
    );

    // Delete the anonymous user
    try {
      await FirebaseAdmin.auth().deleteUser(anonymousUID);
      Util.msg("Anonymous user deleted successfully", 32);
    } catch (error) {
      Util.error("Anonymous user not deleted", 31);
    }

    res.json({ result: true, data: updatedUser });
  } catch (error) {
    const errorMessage = error.message
      ? error.message
      : "in updating a user in Firebase";
    console.error(error);
    res.json({ result: false, error: errorMessage });
    return;
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

//===============================================================
// POST : addTokens (used by IA)
//===============================================================
router.post("/addTokens", async (req, res) => {
  const { userId, tokensCount } = req.body;
  console.log("/addTokens : req.body : ", req.body);

  const checkStatus = checkBody(req.body, ["userId", "tokensCount"]);
  if (!checkStatus.status) {
    console.log("1 : checkStatus.error : ", checkStatus.error);
    res.json({ result: false, error: checkStatus.error });
    return;
  }

  try {
    // const user = await User.findOneAndUpdate(
    //   { _id: userId },
    //   { $inc: { "ia.tokenUsed": tokensCount } },
    //   { new: true } // Retourne le document mis à jour
    // );
    const currentDate = new Date();
    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { "ia.tokensUsed": tokensCount },
        $set: { "ia.lastTokenUsedDate": currentDate },
      },
      { new: true } // Retourne le document mis à jour
    );

    if (!user) {
      return res.status(404).json({
        result: false,
        errorMsg: `User not found with id: ${userId}`,
      });
    }

    res.json({ result: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, errorMsg: error.message });
  }
});

module.exports = router;
