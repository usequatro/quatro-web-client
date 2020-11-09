import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import cond from 'lodash/cond';
import { makeStyles } from '@material-ui/core/styles';
import LoadingState from '../dashboard/tasks/LoadingState';

import {
  selectGoogleAPIClient,
  selectGoogleIsFetching,
  selectGoogleSignInStatus
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
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const fetching = useSelector(selectGoogleIsFetching);
  const googleSignInStatus = useSelector(selectGoogleSignInStatus);

  const classes = useStyles();

  const logOutGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signOut();
  };

  return (
    <Box className={classes.container}>
      {cond([
        [() => fetching, () => <LoadingState />],
        [() => fetching && !googleSignInStatus, () => null],
        [() => !fetching && googleSignInStatus, () => (
          <Box className={classes.container}>
            <GoogleCalendarTaskList />
            <Button onClick={() => logOutGoogle()} variant="contained">Log Out Google Calendar</Button>
          </Box>
        )],
        [() => !fetching && !googleSignInStatus, () => <GoogleSignIn />],
      ])}
    </Box>
  )
};

export default GoogleCalendar;
