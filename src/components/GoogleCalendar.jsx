import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import {
  setGoogleAPIClient,
  selectGoogleAPIClient,
  setGoogleSignInStatus,
  selectGoogleSignInStatus
} from '../modules/googleCalendar';

const useStyles = makeStyles(() => ({
  container: {
    padding: 90,
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    alignContent: "center",
  },
}));

const GoogleCalendar = () => {
  const dispatch = useDispatch();
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const googleSignInStatus = useSelector(selectGoogleSignInStatus);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const classes = useStyles();

  const updateSignInStatus = useCallback(
    (bool) => {
      setGoogleSignedIn(bool);
      dispatch(setGoogleSignInStatus(bool));
    },
    [dispatch],
  );

  // useEffect(() => {
  //   console.log('googleSignedIn', googleSignedIn)
  // }, [googleSignedIn]);
  // useEffect(() => {
  //   console.log('googleSignInStatus', googleSignInStatus)
  // }, [googleSignInStatus]);

  const initGoogleClient = useCallback(
    () => {
      const config = {
        "clientId": process.env.REACT_APP_GOOGLE_CLIENT_ID,
        "apiKey": process.env.REACT_APP_GOOGLE_API_KEY,
        "scope": process.env.REACT_APP_GOOGLE_SCOPE,
      };

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
    },
    [googleAPIClient, updateSignInStatus],
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

  const connectGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signIn();
  };

  const logOutGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signOut();
  };

  useEffect(() => {
    injectGoogleAPIScript();
  },[injectGoogleAPIScript]);

  return(
    <Box className={classes.container}>
      { googleSignedIn ? 
          <Button onClick={logOutGoogle} variant="contained">Log Out Google Calendar</Button> :     
            <Button onClick={connectGoogle} variant="contained">Connect Google Calendar</Button> } 
    </Box>
  )
};

export default GoogleCalendar;
