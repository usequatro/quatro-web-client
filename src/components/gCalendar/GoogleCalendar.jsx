import React from 'react';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import cond from 'lodash/cond';
import { makeStyles } from '@material-ui/core/styles';

import LoadingState from '../dashboard/tasks/LoadingState';

import { selectGoogleIsFetching, selectGoogleSignInStatus } from '../../modules/googleCalendar';

import GoogleSignIn from './GoogleSignIn';
import GoogleCalendarTaskList from './GoogleCalendarTaskList';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    paddingTop: '6em',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    border: 'solid 1px rgba(0, 0, 0, 0.12)',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    height: '100vh',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '2em',
    },
  },
  directions: {
    position: 'absolute',
    top: '90px',
    right: '-23px',
  },
}));

const GoogleCalendar = () => {
  const classes = useStyles();

  const fetching = useSelector(selectGoogleIsFetching);
  const googleSignInStatus = useSelector(selectGoogleSignInStatus);

  return (
    <Box>
      {cond([
        [() => fetching, () => <LoadingState />],
        [() => fetching && !googleSignInStatus, () => null],
        [
          () => !fetching && googleSignInStatus,
          () => (
            <Box className={classes.container}>
              <GoogleCalendarTaskList />
            </Box>
          ),
        ],
        [() => !fetching && !googleSignInStatus, () => <GoogleSignIn />],
      ])}
    </Box>
  );
};

export default GoogleCalendar;
