import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  setGoogleAPIClient,
  selectGoogleAPIClient,
  setGoogleSignInStatus,
  selectGoogleSignInStatus
} from '../modules/dashboard';

const GoogleCalendar = () => {
  const dispatch = useDispatch();
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const googleSignInStatus = useSelector(selectGoogleSignInStatus);
  const [googleSignedIn, setGoogleSignedIn] = useState(googleSignInStatus);

  const updateSignInStatus = useCallback(
    (bool) => {
      setGoogleSignedIn(bool)
      dispatch(setGoogleSignInStatus(bool))
    },
    [dispatch, setGoogleSignedIn],
  );

  useEffect(() => {
    // console.log('googleSignedIn', googleSignedIn)
  }, [googleSignedIn])

  const initGoogleClient = useCallback(
    () => {
      const config = {
        "clientId": process.env.REACT_APP_GOOGLE_CLIENT_ID,
        "apiKey": process.env.REACT_APP_GOOGLE_API_KEY,
        "scope": process.env.REACT_APP_GOOGLE_SCOPE,
      };

      googleAPIClient.client.init(config)
        .then(() => {
          // console.log('initClient then');
          // googleAPIClient.auth2.getAuthInstance().signIn();
          // googleAPIClient.auth2.getAuthInstance().signOut();

          // Listen for sign-in state changes.
          googleAPIClient.auth2.getAuthInstance().isSignedIn.listen(googleSignedIn);
          // Handle the initial sign-in state.
          updateSignInStatus(googleAPIClient.auth2.getAuthInstance().isSignedIn.get());
        })
        .catch((e) => {
          console.log("ERROR on initGoogleClient: ", e);
        });
    },
    [googleAPIClient, googleSignedIn, updateSignInStatus],
  );

  const injectGoogleAPIScript = useCallback(
    () => {
      if (googleAPIClient) {
        googleAPIClient.load('client:auth2', initGoogleClient);
      } else {
        const gScript = document.createElement('script');
        gScript.type = 'text/javascript';
        gScript.src = 'https://apis.google.com/js/platform.js?onload=onScriptLoad';
        document.body.appendChild(gScript);
        gScript.onload = () => {
          dispatch(setGoogleAPIClient(window.gapi));
        };
      }
    },
    [dispatch, googleAPIClient, initGoogleClient],
  )

  useEffect(() => {
    injectGoogleAPIScript();
  },[injectGoogleAPIScript]);

  return(null)
};

export default GoogleCalendar;
