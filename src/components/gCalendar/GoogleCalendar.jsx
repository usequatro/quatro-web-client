import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import cond from 'lodash/cond';
import { makeStyles } from '@material-ui/core/styles';
import LoadingState from '../dashboard/tasks/LoadingState';

import {
  setGoogleAPIClient,
  selectGoogleAPIClient,
  setGoogleSignInStatus,
  selectGoogleIsFetching,
  setGoogleIsFetching,
} from '../../modules/googleCalendar';

import GoogleSignIn from './GoogleSignIn';
import GoogleCalendarTaskList from './GoogleCalendarTaskList';

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    padding: 90,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    border: 'solid 1px rgba(0, 0, 0, 0.12)',
    resize: 'horizontal',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column'
  },
}));

const GoogleCalendar = () => {
  const dispatch = useDispatch();
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const fetching = useSelector(selectGoogleIsFetching);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);

  const classes = useStyles();

  const updateSignInStatus = useCallback(
    (bool) => {
      setGoogleSignedIn(bool);
      dispatch(setGoogleSignInStatus(bool));
      dispatch(setGoogleIsFetching(false));
    },
    [dispatch],
  );

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

          // const idToken = googleAPIClient.auth2.getAuthInstance().currentUser.get().wc.id_token
          // const accessToken = 
          // googleAPIClient.auth2.getAuthInstance().currentUser.get().wc.accessToken
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

  const logOutGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signOut();
  };

  useEffect(() => {
    injectGoogleAPIScript();
  },[injectGoogleAPIScript]);

  return(
    <Box className={classes.container}>
      {cond([
        [() => fetching, () => <LoadingState />],
        [() => fetching && !googleSignedIn, () => null],
        [() => !fetching && googleSignedIn, () => (
          <Box className={classes.container}>
            <GoogleCalendarTaskList />
            <Button onClick={() => logOutGoogle()} variant="contained">Log Out Google Calendar</Button>
          </Box>
        )],
        [() => !fetching && !googleSignedIn, () => <GoogleSignIn />],
      ])}
    </Box>
  )
};

export default GoogleCalendar;
