import React from 'react';
import { useSelector } from 'react-redux';
import { Resizable } from 're-resizable';

import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import Box from '@material-ui/core/Box';
import cond from 'lodash/cond';
import { makeStyles } from '@material-ui/core/styles';

import LoadingState from '../dashboard/tasks/LoadingState';

import { selectGoogleIsFetching, selectGoogleSignInStatus } from '../../modules/googleCalendar';

import GoogleSignIn from './GoogleSignIn';
import GoogleCalendarTaskList from './GoogleCalendarTaskList';

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    paddingTop: 100,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    border: 'solid 1px rgba(0, 0, 0, 0.12)',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    height: '100vh',
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

  // const ArrowIcons = () => {
  //   return (
  //     <Box className={classes.directions}>
  //       <ArrowLeftIcon color='action' />
  //       <ArrowRightIcon color='action' />
  //     </Box>
  //   )
  // };

  return (
    <Box>
      {cond([
        [() => fetching, () => <LoadingState />],
        [() => fetching && !googleSignInStatus, () => null],
        [
          () => !fetching && googleSignInStatus,
          () => (
            // <Resizable
            //   defaultSize={{ width: '40%', height: 'auto' }}
            //   minWidth='25%'
            //   maxWidth='100%'
            //   bounds='window'
            //   enable={{ left: false, right: true }}
            // >
            <Box className={classes.container}>
              {/* <ArrowIcons /> */}
              <GoogleCalendarTaskList />
            </Box>
            // </Resizable>
          ),
        ],
        [() => !fetching && !googleSignInStatus, () => <GoogleSignIn />],
      ])}
    </Box>
  );
};

export default GoogleCalendar;
