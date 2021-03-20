import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useMixpanel } from './tracking/MixpanelContext';
import firebase from '../firebase';
import { gapiGetAuthInstance } from '../googleApi';
import debugConsole from '../utils/debugConsole';
import {
  setUserFromFirebaseUser,
  setGapiUser,
  setAuthErrorState,
  considerGivingUpFirebaseAuthStatusWait,
} from '../modules/session';
import {
  SIGNED_IN_WITH_PASSWORD,
  SIGNED_IN_WITH_GOOGLE,
} from '../constants/mixpanelUserProperties';
import { useNotification } from './Notification';
import createOnboardingTasks from '../utils/createOnboardingTasks';

// const AUTH_IFRAME_LOAD_ERROR = 'idpiframe_initialization_failed';

const AuthManager = () => {
  const mixpanel = useMixpanel();
  const dispatch = useDispatch();
  const { notifyError } = useNotification();

  // Load and initial sign in state or listen for changes
  useEffect(() => {
    let unsubscribe;

    gapiGetAuthInstance()
      .then((gapiAuthInstance) => {
        // Initially, we could be logged in
        const firebaseSignedIn = Boolean(firebase.auth().currentUser);
        const googleSignedIn = gapiAuthInstance.isSignedIn.get();
        debugConsole.log('Google API', 'initially signed in', googleSignedIn);
        debugConsole.log('firebase', 'initially signed in', firebaseSignedIn);

        if (firebaseSignedIn) {
          dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
        }
        dispatch(setGapiUser(googleSignedIn ? gapiAuthInstance.currentUser.get() : null));

        // Listen for Google API Auth sign-in state changes.
        gapiAuthInstance.isSignedIn.listen((signInState) => {
          debugConsole.log('Google API', 'listen: change in google sign in state to', signInState);

          dispatch(setGapiUser(signInState ? gapiAuthInstance.currentUser.get() : null));

          // Log in with Firebase after logging in with Google API
          if (signInState) {
            if (!firebase.auth().currentUser) {
              const authResponse = gapiAuthInstance.currentUser.get().getAuthResponse(true);

              const credential = firebase.auth.GoogleAuthProvider.credential(
                authResponse.id_token,
                authResponse.access_token,
              );
              firebase
                .auth()
                .signInWithCredential(credential)
                .then((userCredential) => {
                  debugConsole.log('firebase', 'signInWithCredential', userCredential);
                  if (userCredential.additionalUserInfo.isNewUser) {
                    createOnboardingTasks(userCredential.user.uid);
                  }
                  dispatch(setUserFromFirebaseUser(userCredential.user));
                })
                .catch((error) => {
                  console.error(error); // eslint-disable-line no-console
                });
            }
          }
        });

        // Subscribe to Firebase logging out on its own, we log out Google too
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
          debugConsole.log('firebase', 'onAuthStateChanged', Boolean(user));
          dispatch(setUserFromFirebaseUser(user));

          // If Firebase logs out, we log out Google too
          if (!user && gapiAuthInstance.isSignedIn.get()) {
            gapiAuthInstance.signOut().then(() => {
              debugConsole.log('Google API', 'google logged out because Firebase logged out');
            });
          }
        });

        const timeout = setTimeout(() => dispatch(considerGivingUpFirebaseAuthStatusWait()), 5000);
        return () => {
          clearTimeout(timeout);
        };
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);

        notifyError(`Google Authentication setup error. ${error.details || ''}`);
        dispatch(setAuthErrorState());
      });
    return unsubscribe;
  }, [dispatch, notifyError]);

  // Mixpanel tracking
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user && user.uid) {
        try {
          mixpanel.identify(user.uid);

          // These properties are updated for Mixpanel when logging-in and on every refresh
          mixpanel.people.set({
            $name: user.displayName,
            $email: user.email,
            $created: user.metadata.creationTime,
            [SIGNED_IN_WITH_PASSWORD]: Boolean(
              user.providerData.find(({ providerId }) => providerId === 'password'),
            ),
            [SIGNED_IN_WITH_GOOGLE]: Boolean(
              user.providerData.find(({ providerId }) => providerId === 'google.com'),
            ),
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
