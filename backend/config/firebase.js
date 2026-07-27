// firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('../../questchain-be062-firebase-adminsdk-fbsvc-f7924f2618.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize the services you need (e.g., Firestore, Auth)
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };