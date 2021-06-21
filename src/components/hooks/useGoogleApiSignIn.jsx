import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { gapiGetAuthInstance, gapiGrantCalendarManagementScope } from '../../googleApi';
import firebase, {
  firebaseUpdateUserProfile,
  firebaseConnectGoogleAccountFromGapiCredential,
} from '../../firebase';
import { setUserFromFirebaseUser, setGapiUser } from '../../modules/session';
import debugConsole from '../../utils/debugConsole';
import { useNotification } from '../Notification';
import {
  GOOGLE_ACCOUNT_CALENDAR_SCOPE_GRANTED,
  GOOGLE_ACCOUNT_LINKED,
} from '../../constants/mixpanelEvents';
import { useMixpanel } from '../tracking/MixpanelContext';

/**
 * This hook exists because of how complex the different cases for signing in with Google API are
 */
export default function useGoogleApiSignIn() {
  const dispatch = useDispatch();
  const { notifyError } = useNotification();
  const mixpanel = useMixpanel();

  const grantAccessToGoogleCalendar = useCallback(
    () =>
      gapiGrantCalendarManagementScope()
        .then(() => {
          mixpanel.track(GOOGLE_ACCOUNT_CALENDAR_SCOPE_GRANTED);
        })
        .then(async () => {
          // Refresh scopes in Redux
          const authInstance = await gapiGetAuthInstance();
          dispatch(
            setGapiUser(authInstance.isSignedIn.get() ? authInstance.currentUser.get() : null),
          );
        })
        .catch((error) => {
          if (error.code === 'auth/popup-closed-by-user') {
            console.info(error); // eslint-disable-line no-console
            return;
          }
          console.error(error); // eslint-disable-line no-console
          notifyError('An error happened');
        }),
    [notifyError, dispatch, mixpanel],
  );

  const signInToConnectGoogleAccount = useCallback(async () => {
    const firebaseGoogleAuthProvider = firebase
      .auth()
      .currentUser.providerData.find(({ providerId }) => providerId === 'google.com');
    if (firebaseGoogleAuthProvider) {
      throw new Error("This function shouldn't be called when account is already connected");
    }

    const authInstance = await gapiGetAuthInstance();
    return (
      authInstance
        // @link https://developers.google.com/identity/sign-in/web/reference#googleauthsignin
        .signIn({
          ux_mode: 'redirect',
          redirect_uri: `${window.location.origin}/dashboard/calendars?googleconnected=1`,
        })
    );
  }, []);

  const connectGoogleAccount = useCallback(async () => {
    const authInstance = await gapiGetAuthInstance();
    const authResponse = authInstance.currentUser.get().getAuthResponse(true);
    await firebaseConnectGoogleAccountFromGapiCredential(
      authResponse.id_token,
      authResponse.access_token,
    );

    mixpanel.track(GOOGLE_ACCOUNT_LINKED);

    const newFirebaseUser = firebase.auth().currentUser;
    const googleProvider = newFirebaseUser.providerData.find(
      ({ providerId }) => providerId === 'google.com',
    );
    const newPhotoUrl = !newFirebaseUser.photoURL ? (googleProvider || {}).photoURL : undefined;
    const newDisplayName = !newFirebaseUser.displayName
      ? (googleProvider || {}).displayName
      : undefined;

    if (newPhotoUrl || newDisplayName) {
      // We intentionally don't return this promise so we don't wait on it
      firebaseUpdateUserProfile({
        ...(newPhotoUrl ? { photoURL: newPhotoUrl } : {}),
        ...(newDisplayName ? { displayName: newDisplayName } : {}),
      }).then(() => {
        // Refresh user in Redux
        dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
      });
    }
  }, [dispatch, mixpanel]);

  const signInAlreadyConnectedGoogleAccount = useCallback(async () => {
    const firebaseGoogleAuthProvider = firebase
      .auth()
      .currentUser.providerData.find(({ providerId }) => providerId === 'google.com');
    if (!firebaseGoogleAuthProvider) {
      throw new Error("This function shouldn't be called when google account isn't connected");
    }

    const authInstance = await gapiGetAuthInstance();
    return (
      authInstance
        // @link https://developers.google.com/identity/sign-in/web/reference#googleauthsignin
        .signIn({ ux_mode: 'redirect' })
        .then(async () => {
          const gapiUserId = authInstance.currentUser.get().getId();
          if (gapiUserId !== firebaseGoogleAuthProvider.uid) {
            return authInstance.signOut().then(() => {
              notifyError(
                `Looks like your account is already connected to ${firebaseGoogleAuthProvider.email},
                but you selected a different Google account.
                Please select ${firebaseGoogleAuthProvider.email}`,
              );
            });
          }
          return undefined;
        })
        .catch((error) => {
          if (error.code === 'auth/popup-closed-by-user') {
            console.info(error); // eslint-disable-line no-console
            return;
          }
          console.error(error); // eslint-disable-line no-console
          notifyError('An error happened');
        })
    );
  }, [notifyError]);

  const signOut = useCallback(async () => {
    const googleApiSignOut = (await gapiGetAuthInstance()).signOut().then(() => {
      debugConsole.log('Google API', 'signOut');
    });
    const firebaseSignOut = firebase
      .auth()
      .signOut()
      .then((result) => {
        debugConsole.log('firebase', 'signOut');
        return result;
      });

    return Promise.all([googleApiSignOut, firebaseSignOut])
      .then(() => {
        // Redirect to initial screen to reset the Redux
        window.location = window.location.origin;
      })
      .catch((error) => {
        notifyError('An error happened');
        console.error(error); // eslint-disable-line no-console
      });
  }, [notifyError]);

  return {
    signInToConnectGoogleAccount,
    signInAlreadyConnectedGoogleAccount,
    signOut,
    grantAccessToGoogleCalendar,
    connectGoogleAccount,
  };
}
