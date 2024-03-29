import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';
import 'firebase/functions';

import debugConsole from './utils/debugConsole';

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  });
}

if (process.env.REACT_APP_DEVELOPMENT) {
  window.firebase = firebase;
}

if (process.env.REACT_APP_FIREBASE_EMULATOR && window.location.hostname === 'localhost') {
  debugConsole.log('Firebase', 'Using emulator for auth() and functions()');
  firebase.auth().useEmulator('http://localhost:9099/');
  firebase.app().functions().useEmulator('localhost', 5001);
}

export default firebase;

export const firebaseSendEmailVerification = async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("Can't send email verification since user isn't logged in");
  }
  // @doc: https://firebase.google.com/docs/reference/js/firebase.User#sendemailverification
  return user.sendEmailVerification();
};

/**
 * @link https://firebase.google.com/docs/reference/js/firebase.User#reload
 * @returns {Promise<Object>}
 */
export const firebaseReloadUser = () =>
  firebase
    .auth()
    .currentUser.reload()
    .then(() => firebase.auth().currentUser);

export const firebaseUpdateUserProfile = async ({ displayName, photoURL }) =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updateProfile({ displayName, photoURL }).then(() => {
      debugConsole.log('Firebase', 'User profile updated', { displayName, photoURL });
    });
  });

export const firebaseUpdateUserEmail = async (email) =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updateEmail(email);
  });

export const firebaseUpdateUserPassword = async (newPassword) =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updatePassword(newPassword);
  });

export const firebaseDeleteUser = async () =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    // @link https://firebase.google.com/docs/reference/js/firebase.User#delete
    return user.delete().then(() => {
      debugConsole.log('Firebase', 'User deleted');
    });
  });

export const firebaseReauthenticateUserWithPassword = async (currentPassword) =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(credential);
  });

export const firebaseConnectGoogleAccountFromGapiCredential = (idToken, accessToken) => {
  const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
  return firebase
    .auth()
    .currentUser.linkWithCredential(credential)
    .then((result) => firebase.auth().signInWithCredential(result.credential))
    .then((userCredential) => {
      debugConsole.log('Firebase', 'Firebase account connected to Google account with credential');
      return userCredential;
    });
};

/**
 * This function should go followed by executing the callable processProviderUnlink
 * @param {string} providerId
 * @returns {Promise<firebase.User>}
 */
export const firebaseUnlinkProvider = (providerId) => {
  if (providerId !== 'google.com') {
    throw new Error('Not implemented');
  }
  debugConsole.info('Firebase', `Unlinking provider ${providerId}`);
  return firebase.auth().currentUser.unlink(providerId);
};

/**
 * Returns a promise with the ID token used to identify the user with HTTP Firebase Functions
 * @returns {Promise<string>}
 */
export const firebaseGetAuthIdToken = () => firebase.auth().currentUser.getIdToken();
