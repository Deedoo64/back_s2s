const FirebaseAdmin = require("firebase-admin");

let firebaseInitialized = false;

try {
  FirebaseAdmin.initializeApp({
    credential: FirebaseAdmin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: "https://foodstock-424310.firebaseio.com",
  });

  firebaseInitialized = true;
  console.log("Firebase has been initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

try {
  // Vérification supplémentaire en essayant de récupérer un utilisateur inexistant
  FirebaseAdmin.auth()
    .getUser("nonexistent-user")
    .catch((error) => {
      if (error.code === "auth/user-not-found") {
        console.log("Firebase project configuration is valid");
      } else {
        console.error("Firebase project configuration is invalid:", error);
        firebaseInitialized = false;
      }
    });
} catch (error) {
  console.error("Error initializing Firebase:", error);
  firebaseInitialized = false;
}

module.exports = FirebaseAdmin;
