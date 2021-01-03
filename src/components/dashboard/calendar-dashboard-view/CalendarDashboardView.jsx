import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';

import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import {
  selectGapiUserSignedIn,
  selectGapiUserHasCalendarAccess,
  selectGoogleFirebaseAuthProvider,
  selectGapiUserLoading,
} from '../../../modules/session';
import CalendarView from '../calendar-view/CalendarView';
import * as paths from '../../../constants/paths';
import EmptyState, { IMAGE_CALENDAR } from '../tasks/EmptyState';
import GoogleButton from '../../ui/GoogleButton';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';
import LoaderScreen from '../../ui/LoaderScreen';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';

const useStyles = makeStyles((theme) => ({
  googleAvatar: {
    height: theme.spacing(12),
    width: theme.spacing(12),
  },
}));

const CalendarDashboardView = () => {
  const classes = useStyles();
  const history = useHistory();

  const gapiUserLoading = useSelector(selectGapiUserLoading);
  const fetchingCalendars = useSelector(selectCalendarsAreFetching);
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiUserHasCalendarAccess = useSelector(selectGapiUserHasCalendarAccess);
  const userHasGrantedGoogleCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );
  const calendarIds = useSelector(selectCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const showGoogleCalendarList = () => {
    history.push(paths.CALENDARS);
  };

  const {
    signInToConnectGoogleAccount,
    signInAlreadyConnectedGoogleAccount,
    grantAccessToGoogleCalendar,
  } = useGoogleApiSignIn();

  const [signingIn, setSigningIn] = useState(false);
  const handleSignInToConnectGoogleAccount = () => {
    setSigningIn(true);
    signInToConnectGoogleAccount().then(
      () => setSigningIn(false),
      () => setSigningIn(false),
    );
  };
  const handleGrantAccessToCalendar = () => {
    setSigningIn(true);
    grantAccessToGoogleCalendar().then(
      () => setSigningIn(false),
      () => setSigningIn(false),
    );
  };
  const handleSignInAlreadyConnectedGoogleAccount = () => {
    setSigningIn(true);
    signInAlreadyConnectedGoogleAccount().then(
      () => setSigningIn(false),
      () => setSigningIn(false),
    );
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
              <GoogleButton
                onClick={handleSignInAlreadyConnectedGoogleAccount}
                data-qa="sign-in-existing-account-button"
                endIcon={
                  signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                }
              >
                Sign in with Google
              </GoogleButton>
            </EmptyState>
          ),
        ],
        [
          () => !gapiUserSignedIn,
          () => (
            <EmptyState
              image={IMAGE_CALENDAR}
              text={[
                'Connect to your Google account,',
                'and sync your Quatro tasks to Google Calendar.',
              ]}
            >
              <GoogleButton
                onClick={handleSignInToConnectGoogleAccount}
                data-qa="connect-google-button"
                endIcon={
                  signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                }
              >
                Sign in with Google
              </GoogleButton>
            </EmptyState>
          ),
        ],

        [
          () => !gapiUserHasCalendarAccess || !userHasGrantedGoogleCalendarOfflineAccess,
          () => (
            <EmptyState
              image={IMAGE_CALENDAR}
              text={[
                'Grant access to display your calendars and create events,',
                'and sync your Quatro tasks to Google Calendar.',
              ]}
            >
              <GoogleButton
                onClick={handleGrantAccessToCalendar}
                data-qa="grant-calendar-access-google-button"
                endIcon={
                  signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                }
              >
                Grant access
              </GoogleButton>
            </EmptyState>
          ),
        ],
        [
          () => calendarIds.length === 0,
          () => (
            <EmptyState
              image={IMAGE_CALENDAR}
              text={[
                'Choose a calendar to connect,',
                'and sync your Quatro tasks to Google Calendar.',
              ]}
            >
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
