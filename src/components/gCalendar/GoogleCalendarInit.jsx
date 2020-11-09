import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  setGoogleAPIClient,
  selectGoogleAPIClient,
  setGoogleSignInStatus,
  setGoogleIsFetching,
  getUserCalendars
} from '../../modules/googleCalendar';

const config = {
  "clientId": process.env.REACT_APP_GOOGLE_CLIENT_ID,
  "apiKey": process.env.REACT_APP_GOOGLE_API_KEY,
  "scope": process.env.REACT_APP_GOOGLE_SCOPE,
};

const GoogleCalendarInit = () => {
  const dispatch = useDispatch();
  const googleAPIClient = useSelector(selectGoogleAPIClient);

  const updateSignInStatus = useCallback(
    (bool) => {
      dispatch(setGoogleSignInStatus(bool));
      dispatch(setGoogleIsFetching(false));
      dispatch(getUserCalendars(googleAPIClient));
    },
    [dispatch, googleAPIClient],
  );

  const initGoogleClient = useCallback(
    () => {
      googleAPIClient.client.init(config)
        .then(() => {
          // Listen for sign-in state changes.
          googleAPIClient.auth2.getAuthInstance().isSignedIn.listen(
            state => updateSignInStatus(state));
          // Handle the initial sign-in state.
          updateSignInStatus(googleAPIClient.auth2.getAuthInstance().isSignedIn.get());
        })
        .catch((e) => {
          console.log("ERROR on initGoogleClient: ", e);
        });
      googleAPIClient.client.load('calendar','v3');
    },
    [dispatch, googleAPIClient, updateSignInStatus],
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

  return null;
};

export default GoogleCalendarInit;
