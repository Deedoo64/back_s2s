const FirebaseAdmin = require("firebase-admin");

let firebaseInitialized = false;

if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("Please set the FIREBASE_PROJECT_ID environment variable");
}

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Please set the FIREBASE_PRIVATE_KEY environment variable");
}

if (!process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("Please set the FIREBASE_CLIENT_EMAIL environment variable");
}

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

module.exports = { FirebaseAdmin, firebaseInitialized };
