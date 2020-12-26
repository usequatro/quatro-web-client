import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useMixpanel } from './tracking/MixpanelContext';
import firebase, { firebaseSignInWithCredential } from '../firebase';
import { gapiGetAuthInstance } from '../googleApi';
import debugConsole from '../utils/debugConsole';
import { setUserFromFirebaseUser, setGapiUser } from '../modules/session';
import { logOutReduxState } from '../modules/reset';

const isFirebaseSignedIn = () => Boolean(firebase.auth().currentUser);

const AuthManager = () => {
  const mixpanel = useMixpanel();
  const dispatch = useDispatch();

  // Load and initial sign in state or listen for changes
  useEffect(() => {
    let unsubscribe;

    gapiGetAuthInstance().then((gapiAuthInstance) => {
      // Initially, we could be logged in
      const firebaseSignedIn = isFirebaseSignedIn();
      const googleSignedIn = gapiAuthInstance.isSignedIn.get();
      debugConsole.log('Google API', 'initially signed in', googleSignedIn);
      debugConsole.log('firebase', 'initially signed in', firebaseSignedIn);

      if (firebaseSignedIn) {
        dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
      }
      if (googleSignedIn) {
        dispatch(setGapiUser(gapiAuthInstance.currentUser.get()));
      }

      // Listen for Google Auth sign-in state changes.
      gapiAuthInstance.isSignedIn.listen((signInState) => {
        debugConsole.log('Google API', 'listen: change in google sign in state to', signInState);

        dispatch(setGapiUser(signInState ? gapiAuthInstance.currentUser.get() : null));

        if (signInState) {
          if (!isFirebaseSignedIn()) {
            const authResponse = gapiAuthInstance.currentUser.get().getAuthResponse(true);
            firebaseSignInWithCredential(authResponse.id_token, authResponse.access_token).then(
              () => {
                dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
              },
            );
          }
        }
      });

      // Subscribe to Firebase logging out on its own, we log out Google too
      unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          dispatch(logOutReduxState());
        } else {
          dispatch(setUserFromFirebaseUser(user));
        }

        // If Firebase logs out, we log out Google too
        if (!user && gapiAuthInstance.isSignedIn.get()) {
          gapiAuthInstance.signOut().then(() => {
            debugConsole.log('Google API', 'google logged out because Firebase logged out');
          });
        }
      });
    });
    return unsubscribe;
  }, [dispatch]);

  // Mixpanel tracking
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user && user.uid) {
        try {
          mixpanel.identify(user.uid);
          mixpanel.people.set({
            $name: user.displayName,
            $email: user.email,
            $created: user.metadata.creationTime,
          });
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      }
    });
    return unsubscribe;
  }, [mixpanel]);

  return null;
};

AuthManager.propTypes = {};

export default AuthManager;
