import React, { useEffect, createContext, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { useMixpanel } from './tracking/MixpanelContext';
import firebase, { signInWithCredential } from '../firebase';
import debugConsole from '../utils/debugConsole';
import { setUserFromFirebaseUser, setGapiUser } from '../modules/session';

// This is left out to include the library conditionally if we wanted one day
// const injectGoogleAPIScript = (onLoad) => {
//   const gScript = document.createElement('script');
//   gScript.type = 'text/javascript';
//   gScript.src = 'https://apis.google.com/js/platform.js';
//   document.body.appendChild(gScript);
//   gScript.onload = onLoad;
// };

const signInFirebaseFromGoogleAuth = () => {
  const currentUser = window.gapi.auth2.getAuthInstance().currentUser.get();
  const authResponse = currentUser.getAuthResponse(true);
  return signInWithCredential(authResponse.id_token, authResponse.access_token);
};

const isFirebaseSignedIn = () => Boolean(firebase.auth().currentUser);

const GoogleAPIContext = createContext();
export const useGoogleAPI = () => useContext(GoogleAPIContext);

export const GoogleAPIContextProvider = ({ children }) => {
  const mixpanel = useMixpanel();
  const dispatch = useDispatch();

  // Load and initial sign in state or listen for changes
  useEffect(() => {
    let unsubscribe;

    new Promise((resolve) => {
      window.gapi.load('client:auth2', resolve);
    })
      .then(() => window.gapi.client.load('calendar', 'v3'))
      .then(() =>
        window.gapi.client.init({
          clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
          scope: process.env.REACT_APP_GOOGLE_AUTH_SCOPES,
        }),
      )
      .then(() => {
        // Initially, we could be logged in
        const firebaseSignedIn = isFirebaseSignedIn();
        const googleSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
        debugConsole.log('Google API', 'initially signed in', googleSignedIn);
        debugConsole.log('firebase', 'initially signed in', firebaseSignedIn);

        if (firebaseSignedIn) {
          dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
        }
        if (googleSignedIn) {
          dispatch(setGapiUser(window.gapi.auth2.getAuthInstance().currentUser.get()));
        }

        // Listen for Google Auth sign-in state changes.
        window.gapi.auth2.getAuthInstance().isSignedIn.listen((signInState) => {
          debugConsole.log('Google API', 'listen: change in google sign in state to', signInState);

          dispatch(
            setGapiUser(signInState ? window.gapi.auth2.getAuthInstance().currentUser.get() : null),
          );

          if (signInState) {
            if (!isFirebaseSignedIn()) {
              signInFirebaseFromGoogleAuth().then(() => {
                dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
              });
            }
          }
        });

        // Subscribe to Firebase logging out on its own, we log out Google too
        unsubscribe = firebase.auth().onAuthStateChanged((user) => {
          dispatch(setUserFromFirebaseUser(user));

          // If Firebase logs out, we log out Google too
          if (!user && window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
            window.gapi.auth2
              .getAuthInstance()
              .signOut()
              .then(() => {
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

  const { gapi } = window;
  const contextValue = useMemo(
    () => ({
      gapi,
      signIn: () => {
        if (firebase.auth().currentUser) {
          throw new Error("signIn isn't expected when Firebase user is already logged in");
        }
        return window.gapi.auth2.getAuthInstance().signIn();
      },
      signInExistingUser: async () =>
        window.gapi.auth2
          .getAuthInstance()
          .signIn()
          .then(() => {
            const gapiUserId = window.gapi.auth2.getAuthInstance().currentUser.get().getId();
            const firebaseGoogleUserId = firebase
              .auth()
              .currentUser.providerData.find(({ providerId }) => providerId === 'google.com').uid;

            if (gapiUserId !== firebaseGoogleUserId) {
              return window.gapi.auth2
                .getAuthInstance()
                .signOut()
                .then(() => {
                  throw new Error("Email addresses don't match");
                });
            }
            return undefined;
          }),
      connectGoogle: async () => {
        return firebase
          .auth()
          .currentUser.linkWithPopup(new firebase.auth.GoogleAuthProvider())
          .then((result) => {
            return firebase.auth().signInWithCredential(result.credential);
          });
      },
      signOut: () => window.gapi.auth2.getAuthInstance().signOut(),
    }),
    [gapi],
  );

  return <GoogleAPIContext.Provider value={contextValue}>{children}</GoogleAPIContext.Provider>;
};

GoogleAPIContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
