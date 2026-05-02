const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let initialized = false;

function initFirebase() {
  if (initialized) return admin;
  
  // 1. Try raw JSON from environment variable (Best for Cloudflare/Render/Heroku)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      };
      admin.initializeApp(firebaseConfig);
      initialized = true;
      console.log('Firebase initialized using FIREBASE_SERVICE_ACCOUNT env variable');
      return admin;
    } catch (error) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env variable:', error);
    }
  }

  // 2. Try the actual service account key filename first (in parent directory)
  const keyPath = path.join(__dirname, '..', 'denr-permit-firebase-adminsdk-fbsvc-278e8293a6.json');
  if (fs.existsSync(keyPath)) {
    try {
      const serviceAccount = require(keyPath);
      
      // Initialize Firebase with proper configuration
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      };
      
      admin.initializeApp(firebaseConfig);
      
      initialized = true;
      console.log('Firebase initialized successfully using denr-permit-firebase-adminsdk-fbsvc-278e8293a6.json');
      console.log('Project ID:', serviceAccount.project_id);
      return admin;
    } catch (error) {
      console.error('Error initializing Firebase with service account:', error);
    }
  }
  
  // 3. Fallback to generic serviceAccountKey.json
  const fallbackKeyPath = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(fallbackKeyPath)) {
    try {
      const serviceAccount = require(fallbackKeyPath);
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
        databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        storageBucket: `${serviceAccount.project_id}.appspot.com`
      };
      
      admin.initializeApp(firebaseConfig);
      initialized = true;
      console.log('Firebase initialized using serviceAccountKey.json');
      return admin;
    } catch (error) {
      console.error('Error initializing Firebase with fallback service account:', error);
    }
  }

  // 4. Try GOOGLE_APPLICATION_CREDENTIALS environment variable (file path)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      admin.initializeApp();
      initialized = true;
      console.log('Firebase initialized using GOOGLE_APPLICATION_CREDENTIALS');
      return admin;
    } catch (error) {
      console.error('Error initializing Firebase with environment credentials:', error);
    }
  }

  console.error('No valid Firebase credentials found. Please check:');
  console.error('1. Service account key file exists in server folder');
  console.error('2. Firebase project is properly configured');
  console.error('3. Service account has proper permissions');
  return null;
}

module.exports = { initFirebase };
