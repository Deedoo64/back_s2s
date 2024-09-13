var express = require("express");
var router = express.Router();

const Util = require("../util/util");
const User = require("../models/users");
const Storage = require("../models/storage");
const Item = require("../models/m_item");
const ShoppingList = require("../models/shoppingList");
const { FirebaseAdmin, firebaseInitialized } = require("../modules/firebase");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");
const { refreshToken } = require("firebase-admin/app");

//===============================================================
// GET:/test/user : Test si un utilisateur existe via son email
//===============================================================
router.get("/test/:email", async (req, res) => {
  const email = req.params.email;
  console.log("In route GET:/test/:email : email : ", email);

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    console.log("User exists with email : ", email);
    res.json({ result: true, data: emailExists });
    return;
  }

  res.json({ result: false, errorMsg: "User not found with email : " + email });
});
//===============================================================
// POST : signup
//===============================================================
router.post("/signup", async (req, res) => {
  // console.log("/signup : req.body : ", req.body);
  const checkStatus = checkBody(req.body, ["nickname", "email", "password"]);
  if (!checkStatus.status) {
    console.log("1 : checkStatus.error : ", checkStatus.error);
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }
  const { nickname, email, password } = req.body;

  try {
    // const nicknameExists = await User.findOne({ nickname: nickname });
    // if (nicknameExists) {
    //   console.log("2 : data != null");
    //   res.json({ result: false, errorMsg: "Nickname already exists" });
    //   return;
    // }

    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      console.log("3 : data != null");
      res.json({ result: false, errorMsg: "Email already exists" });
      return;
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = new User({
      nickname: nickname,
      email: email,
      password: hash,
      token: uid2(32), // Token created here
      autoLogin: false,
      source: "Email",
    });

    const savedUser = await newUser.save();
    console.log("4 : save");
    res.json({ result: true, data: savedUser });
  } catch (error) {
    console.error(error);
    console.log("Error during User registration");
    const errorMessage = error.message ? error.message : "in registration";

    res.json({ result: false, errorMsg: errorMessage });
  }
});

//===============================================================
// POST : signin
//===============================================================
router.post("/signin", async (req, res) => {
  console.log("/signin : req.body : ", req.body);
  const checkStatus = checkBody(req.body, ["email", "password"]);
  if (!checkStatus.status) {
    res.json({ result: false, errorMsg: checkStatus.error });
    return;
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({ result: false, errorMsg: "Email not found" });
      return;
    }
    // Do not check any more the password since it is checked in Firebase
    // if (!bcrypt.compareSync(req.body.password, user.password)) {
    //   res.json({ result: false, errorMsg: "Wrong password" });
    //   return;
    // }

    console.log("About to save : ", user);

    // Renouveler le token et le sauvegarder
    user.token = uid2(32);
    await user.save();
    // Peut etre juste mad token au lieu de resauver tout

    console.log("user : ", user);
    res.json({ result: true, data: user });
  } catch (error) {
    const errorMessage = error.message ? error.message : "in signin";
    console.error(error);
    res.json({ result: false, errorMsg: errorMessage });
  }
});

//===============================================================
// POST : signin with token, avoid sending password
//===============================================================
router.post("/signinWithToken", (req, res) => {
  const checkStatus = checkBody(req.body, ["token"]);
  if (!checkStatus.status) {
    res.json({ result: false, error: checkStatus.error });
    return;
  }

  User.findOne({
    token: req.body.token,
  })
    .then((user) => {
      if (!user) {
        res.json({
          result: false,
          error: "No user found for token or token expired",
        });
        return;
      }

      console.log("user : ", user);
      res.json({ result: true, data: user });
    })
    .catch((error) => {
      const errorMessage = error.message ? error.message : "in signinWithToken";
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
  if (!firebaseInitialized) {
    return res.json({
      result: false,
      errorMsg: "Firebase not initialized in backend",
    });
  }

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
  if (!firebaseInitialized) {
    return res.json({
      result: false,
      errorMsg: "Firebase not initialized in backend",
    });
  }

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
// POST : /desanonymateAccount
// Link a Google or new Email/Password account to an anonymous account
// Ensure coherence with frontend (UserServices.dart)
const POLICIES = {
  KEEP_ANONYMOUS: "KeepAnonymous",
  KEEP_FIREBASE: "KeepFirebase",
  RETURN_ERROR_IF_FIREBASE_ALREADY_EXIST: "ErrorIfFirebaseAlreadyExist",
};
//===============================================================
router.post("/desanonymateAccount", async (req, res) => {
  console.log("/desanonymateAccount : req.body : ", req.body);
  if (!firebaseInitialized) {
    return res.json({
      result: false,
      errorMsg: "Firebase not initialized in backend",
    });
  }

  const checkStatus = checkBody(req.body, [
    "firebaseUID",
    "anonymousUID",
    "email",
    "source",
    "policy",
  ]);

  if (!checkStatus) {
    return res.status(400).json({
      result: false,
      errorMsg: "Invalid request body",
    });
  }

  const { firebaseUID, anonymousUID, email, source, policy } = req.body;

  try {
    const existingUserWithFirebaseUID = await User.findOne({ firebaseUID });

    let deleteFirebaseUser = false;

    if (existingUserWithFirebaseUID) {
      switch (policy) {
        case POLICIES.RETURN_ERROR_IF_FIREBASE_ALREADY_EXIST:
          Util.error(
            `User ${existingUserWithFirebaseUID.email} already exists with firebaseUID : ${firebaseUID}`
          );
          return res.json({
            result: false,
            errorCode: 10,
            errorMsg: `Account ${existingUserWithFirebaseUID.email} has already been associated with an anonymous account`,
          });

        case POLICIES.KEEP_FIREBASE:
          try {
            const deletedUser = await User.findOneAndDelete({
              firebaseUID: anonymousUID,
            });
            console.log("Deleted user : ", deletedUser);
            Util.msg("Anonymous user deleted successfully", 32);

            await FirebaseAdmin.auth().deleteUser(anonymousUID);
            Util.msg("Anonymous user deleted successfully in Firebase", 32);

            return res.json({
              result: true,
              data: existingUserWithFirebaseUID,
            });
          } catch (error) {
            return Util.catchError(
              res,
              error,
              `Error while deleting anonymous account ${anonymousUID}`
            );
          }

        case POLICIES.KEEP_ANONYMOUS:
          deleteFirebaseUser = true;
          break;

        default:
          Util.error("Unknown policy : ", policy);
          return res.json({
            result: false,
            errorMsg: "Unknown policy in desanonymateAccount",
          });
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUID: anonymousUID },
      {
        firebaseUID,
        email,
        source,
      },
      { new: true }
    );

    console.log("Updated user : ", updatedUser);

    try {
      await FirebaseAdmin.auth().deleteUser(anonymousUID);
      Util.msg("Anonymous user deleted successfully in Firebase", 32);
    } catch (error) {
      Util.warning("Anonymous user not deleted", 31);
    }

    if (deleteFirebaseUser) {
      try {
        await User.findOneAndDelete({ firebaseUID });
      } catch (error) {
        Util.error("Error while deleting previous firebase account", 31);
        return res.json({
          result: false,
          errorMsg: "Error while deleting previous firebase account",
        });
      }
    }

    res.json({ result: true, data: updatedUser });
  } catch (error) {
    const errorMessage = error.message || "Error in updating user in Firebase";
    console.error(error);
    res.json({ result: false, errorMsg: errorMessage });
  }
});

// router.post("/desanonymateAccount", async (req, res) => {
//   console.log("/desanonymateAccount : req.body : ", req.body);
//   const checkStatus = checkBody(req.body, [
//     "firebaseUID", // New firebase connection, may exists in DB
//     "anonymousUID", // Existing anonymous account
//     "email",
//     "source",
//     "policy",
//   ]);

//   if (!checkStatus) {
//     return res.status(400).json({
//       result: false,
//       errorMsg: "Invalid request body",
//     });
//   }
//   // policy may have following value :
//   // "keepAnonymous" : anonymous account data are lost,
//   // "keepFirebase" : previous firebase user data are lost,
//   // "" : Error if previous firebase user exists
//   const { firebaseUID, anonymousUID, email, source, policy } = req.body;

//   const existingUserWithFirebaseUID = await User.findOne({
//     firebaseUID: firebaseUID,
//   });
//   let deleteFirebaseUser = false;
//   if (existingUserWithFirebaseUID) {
//     // If the target connexion alraedy exists in mongoDB, it means that
//     // it already contains data. If no policy is provided, generate an error message.
//     if (policy === POLICIES.RETURN_ERROR_IF_FIREBASE_ALREADY_EXIST) {
//       Util.error(
//         `User ${existingUserWithFirebaseUID.email} already exists with firebaseUID : `,
//         firebaseUID
//       );
//       Util.error(
//         "It can not be associted to an anonymous user, send errorCode : 10"
//       );
//       res.json({
//         result: false,
//         errorCode: 10, // Should be handled in front-end
//         errorMsg: `Account ${existingUserWithFirebaseUID.email}  has already been associated with an anonymous account`,
//       });
//       return;
//     } else if (policy == POLICIES.KEEP_FIREBASE) {
//       // In this case, the previous connection is kept, and the anonymous account is deleted
//       // 1.a) The anonymous account is deleted in mongoDB ...
//       try {
//         const deletedUser = await User.findOneAndDelete({
//           firebaseUID: anonymousUID,
//         });
//         console.log("Deleted user : ", deletedUser);
//         Util.msg("Anonymous user deleted successfully", 32);
//       } catch (error) {
//         res.json({
//           result: false,
//           errorMsg: `Error while deleting anonymous account ${anonymousUID}`,
//         });
//         return;
//       }
//       // 1.b) ... remove anonymous account in firebase ...
//       try {
//         await FirebaseAdmin.auth().deleteUser(anonymousUID);
//         Util.msg("Anonymous user deleted successfully in Firebase", 32);
//       } catch (error) {
//         Util.warning("Anonymous user not deleted", 31);
//       }

//       // 1.c)... than , returns the existing firebase account (Google, Facebook, etc.)
//       res.json({ result: true, data: existingUserWithFirebaseUID });
//       return;
//     } else if (policy == POLICIES.KEEP_ANONYMOUS) {
//       deleteFirebaseUser = true;
//     } else {
//       Util.error("Unknown policy : ", policy);
//       res.json({
//         result: false,
//         errorMsg: "Unknown policy in desanonymateAccount",
//       });
//       return;
//     }
//   }

//   // Replace anonymous account by a new one (Google, Facebook, etc.)
//   // In mongoDB, update the firebaseUID of anonymous account matching anonymousUID
//   // with the new firebaseUID.
//   try {
//     const updatedUser = await User.findOneAndUpdate(
//       { firebaseUID: anonymousUID },
//       {
//         firebaseUID: firebaseUID,
//         email: email,
//         source: source,
//       },
//       { new: true } // Cette option renvoie le document mis à jour
//     );

//     console.log("Updated user : ", updatedUser);

//     // Remove obsolete anonymous account in firebase
//     try {
//       await FirebaseAdmin.auth().deleteUser(anonymousUID);
//       Util.msg("Anonymous user deleted successfully in Firebase", 32);
//     } catch (error) {
//       Util.warning("Anonymous user not deleted", 31);
//     }

//     // In the policy = keepAnonymous, the previous firebase user is deleted
//     if (deleteFirebaseUser) {
//       try {
//         await User.findOneAndDelete({ firebaseUID: firebaseUID });
//       } catch (error) {
//         Util.error("Error while deleting previous firebase account", 31);
//         res.json({
//           result: false,
//           errorMsg: "Error while deleting previous firebase account",
//         });
//         return;
//       }
//     }

//     // Did si policy = keepFirebase, than udpateUser is null !!!!!
//     res.json({ result: true, data: updatedUser });
//   } catch (error) {
//     const errorMessage = error.message
//       ? error.message
//       : "in updating a user in Firebase";
//     console.error(error);
//     res.json({ result: false, errorMsg: errorMessage });
//     return;
//   }
//   // END MY_VERSION
// });

//===============================================================
// PUT : /update
//===============================================================
router.put("/update/:id", async (req, res) => {
  // console.log(`/update/${req.params.id} : ${req.body}`);
  try {
    const userId = req.params.id;
    const { nickname } = req.body;

    console.log("userId : ", userId);
    console.log("nickname : ", nickname);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname },
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
    res.json({ result: false, errorMsg: checkStatus.error });
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

//===============================================================
// DELETE/<email> : delete users and all its data (used by IA)
//===============================================================
router.delete("/account/:email", async (req, res) => {
  const email = req.params.email;
  console.log("In route DELETE:/users/delete/:email : email : ", email);
  var deletedItems = 0;
  var deletedStorages = 0;
  var deletedShoppingLists = 0;
  var deletedFirebaseUser = "";

  try {
    // Cherche l'utilisateur par son email
    var user = await User.findOne({ email: email });
    if (!user) {
      res.json({
        result: false,
        errorMsg: `User not found with email : ${email}`,
      });
      return;
    }
    console.log(`User : ${user} found.`);
    // Supprimer tous les storages associés à cet utilisateur
    var result = await Storage.deleteMany({ userId: user._id });
    deletedStorages = result.deletedCount;
    console.log(`${result.deletedCount} Storages deleted.`);

    result = await Item.deleteMany({ userId: user._id });
    deletedItems = result.deletedCount;
    console.log(`${result.deletedCount} Items deleted.`);

    result = await ShoppingList.deleteMany({ userId: user._id });
    deletedShoppingLists = result.deletedCount;

    // Recupere et supprime l'utilsateur Firebase si il est défini
    var firebaseUser = null;
    if (user.firebaseUID) {
      firebaseUser = await FirebaseAdmin.auth().getUser(user.firebaseUID);
      console.log("Firebase user found : ", user.firebaseUID);
    } else console.log("No Firebase user defined for user : ", user.email);
    // Supprimer l'utilisateur Firebase
    if (firebaseUser) {
      await FirebaseAdmin.auth().deleteUser(user.firebaseUID);
      console.log("Firebase user deleted !!!!!!!!!!!");
      deletedFirebaseUser = user.firebaseUID;
    }

    // Supprimer l'utilisateur MongoDB
    user = await User.deleteOne({ email: email });
    if (!user) {
      res.json({
        result: false,
        errorMsg: `User not found with email : ${email}`,
      });
      return;
    }
    console.log("MongoDB user deleted : ", user);
    // Créer un objet avec les données supprimées
    // Nombre d'items, de stockage de user
    const data = {
      deletedItems,
      deletedStorages,
      deletedShoppingLists,
      deleteFirebaseUser: deletedFirebaseUser,
    };
    res.json({ result: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ result: false, errorMsg: error.message });
  }
});
module.exports = router;
