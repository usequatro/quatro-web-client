import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

/**
 * Returns the firebase object containing other namespaces.
 * This is preferrable over importing from 'firebase/app' to ensure that we have it initialized.
 *
 * @return {Object}
 */
export default function getFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: process.env.REACT_APP_FIREBASE_PUBLIC_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    });

    if (process.env.REACT_APP_DEVELOPMENT) {
      window.firebase = firebase;
    }
  }

  return firebase;
}

/**
 * @return {firebase.firestore.Firestore}
 */
export const getFirestore = () => getFirebase().firestore();

/**
 * @return {firebase.auth.Auth}
 */
export const getAuth = () => getFirebase().auth();

// And yes, my friend,  we initialize you the moment you're loaded
getFirebase();
