import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

import { useNotification } from '../../Notification';
import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import {
  selectGapiUserSignedIn,
  selectGoogleFirebaseAuthProvider,
  selectGapiUserLoading,
} from '../../../modules/session';
import CalendarView from '../calendar-view/CalendarView';
import * as paths from '../../../constants/paths';
import EmptyState, { IMAGE_CALENDAR } from '../tasks/EmptyState';
import GoogleButton from '../../ui/GoogleButton';
import { gapiSignInExistingUser } from '../../../googleApi';
import { firebaseConnectGoogleAccount } from '../../../firebase';
import LoaderScreen from '../../ui/LoaderScreen';

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
  const gapiUserLoading = useSelector(selectGapiUserLoading);
  const fetchingCalendars = useSelector(selectCalendarsAreFetching);
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const calendarIds = useSelector(selectCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const showGoogleCalendarList = () => {
    history.push(paths.CALENDARS);
  };

  const handleConnectGoogle = () => {
    firebaseConnectGoogleAccount()
      .then(() => {
        history.push(paths.CALENDARS);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError('An error happened');
      });
  };

  const handleSignInExistingUser = () => {
    gapiSignInExistingUser().catch((error) => {
      console.error(error); // eslint-disable-line no-console
      notifyError('An error happened');
    });
  };

  return (
    <Box>
      {cond([
        [() => gapiUserLoading || fetchingCalendars, () => <LoaderScreen delay={5000} />],
        [
          () => !gapiUserSignedIn && googleFirebaseAuthProvider,
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
          () => !gapiUserSignedIn,
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
