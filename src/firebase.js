import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
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

/**
 * @return {firebase.auth.GoogleAuthProvider_Instance}
 */
export const getGoogleAuthProvider = () => new firebase.auth.GoogleAuthProvider();

/**
 * @return {firebase.storage.Storage}
 */
export const getStorage = () => getFirebase().storage();

export const sendEmailVerification = async () => {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error("Can't send email verification since user isn't logged in");
  }
  // @doc: https://firebase.google.com/docs/reference/js/firebase.User#sendemailverification
  return user.sendEmailVerification();
};

export const getUserProviders = () => {
  const user = getAuth().currentUser;
  return ((user && user.providerData) || []).map((provider) => provider.providerId);
};

export const updateUserProfile = async ({ displayName, photoURL }) =>
  Promise.resolve(getAuth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updateProfile({ displayName, photoURL });
  });

export const updateUserEmail = async (email) =>
  Promise.resolve(getAuth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updateEmail(email);
  });

export const updateUserPassword = async (newPassword) =>
  Promise.resolve(getAuth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.updatePassword(newPassword);
  });

export const deleteUser = async () =>
  Promise.resolve(getAuth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    return user.delete();
  });

export const reauthenticateUserWithPassword = async (currentPassword) =>
  Promise.resolve(getAuth().currentUser).then((user) => {
    if (!user) {
      throw new Error('No logged in user');
    }
    const credential = getFirebase().auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(credential);
  });

// And yes, my friend,  we initialize you the moment you're loaded
getFirebase();
