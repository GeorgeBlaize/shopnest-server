const admin = require('firebase-admin');
const env = require('./env');

let app = null;

function getFirebaseApp() {
  if (app) return app;
  if (!env.firebaseServiceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured on the server');
  }
  const serviceAccount = JSON.parse(env.firebaseServiceAccountJson);
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  return app;
}

async function verifyFirebaseIdToken(idToken) {
  const firebaseApp = getFirebaseApp();
  return admin.auth(firebaseApp).verifyIdToken(idToken);
}

module.exports = { verifyFirebaseIdToken };
