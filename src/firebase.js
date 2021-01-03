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

export const firebaseSignInWithCredential = (idToken, accessToken) => {
  const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
  return firebase
    .auth()
    .signInWithCredential(credential)
    .then((result) => {
      debugConsole.log('firebase', 'signInWithCredential', result);
      return result;
    });
};

export const firebaseSendEmailVerification = async () => {
  const user = firebase.auth().currentUser;
  if (!user) {
    throw new Error("Can't send email verification since user isn't logged in");
  }
  // @doc: https://firebase.google.com/docs/reference/js/firebase.User#sendemailverification
  return user.sendEmailVerification();
};

export const firebaseUpdateUserProfile = async ({ displayName, photoURL }) =>
  Promise.resolve(firebase.auth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updateProfile({ displayName, photoURL });
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
    return user.delete();
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
    .then((result) => {
      return firebase.auth().signInWithCredential(result.credential);
    });
};
