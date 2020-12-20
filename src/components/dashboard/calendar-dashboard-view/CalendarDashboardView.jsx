import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

import { useNotification } from '../../Notification';
import { selectCalendarIds } from '../../../modules/calendars';
import { selectGapiUserSignedIn, selectGoogleFirebaseAuthProvider } from '../../../modules/session';
import CalendarView from '../calendar-view/CalendarView';
import * as paths from '../../../constants/paths';
import EmptyState, { IMAGE_CALENDAR } from '../tasks/EmptyState';
import GoogleButton from '../../ui/GoogleButton';
import { useGoogleAPI } from '../../GoogleAPI';

const useStyles = makeStyles((theme) => ({
  googleAvatar: {
    height: theme.spacing(12),
    width: theme.spacing(12),
  },
}));

const emptyStateText = ['Connect to your Google Calendar account,', 'and sync your Quatro tasks.'];

const CalendarDashboardView = () => {
  const classes = useStyles();
  const history = useHistory();

  const { notifyError } = useNotification();
  const { connectGoogle, signInExistingUser } = useGoogleAPI();
  const googleSignedIn = useSelector(selectGapiUserSignedIn);
  const calendarIds = useSelector(selectCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const showGoogleCalendarList = () => {
    history.push(paths.CALENDARS);
  };

  const handleConnectGoogle = () => {
    connectGoogle()
      .then(() => {
        history.push(paths.CALENDARS);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError('An error happened');
      });
  };

  const handleSignInExistingUser = () => {
    signInExistingUser().catch((error) => {
      console.error(error); // eslint-disable-line no-console
      notifyError('An error happened');
    });
  };

  return (
    <Box>
      {cond([
        [
          () => !googleSignedIn && googleFirebaseAuthProvider,
          () => (
            <EmptyState
              image={
                googleFirebaseAuthProvider.photoURL ? (
                  <Avatar
                    alt="Google profile picture"
                    src={googleFirebaseAuthProvider.photoURL}
                    className={classes.googleAvatar}
                  />
                ) : (
                  IMAGE_CALENDAR
                )
              }
              text={`Sign in with Google again to ${googleFirebaseAuthProvider.email} to view your calendars`}
            >
              <GoogleButton onClick={handleSignInExistingUser}>Sign in with Google</GoogleButton>
            </EmptyState>
          ),
        ],
        [
          () => !googleSignedIn,
          () => (
            <EmptyState image={IMAGE_CALENDAR} text={emptyStateText}>
              <GoogleButton onClick={() => handleConnectGoogle()}>Sign in with Google</GoogleButton>
            </EmptyState>
          ),
        ],
        [
          () => calendarIds.length === 0,
          () => (
            <EmptyState image={IMAGE_CALENDAR} text={emptyStateText}>
              <Button variant="contained" color="primary" onClick={() => showGoogleCalendarList()}>
                Connect Calendar
              </Button>
            </EmptyState>
          ),
        ],
        [() => true, () => <CalendarView />],
      ])}
    </Box>
  );
};

export default CalendarDashboardView;
