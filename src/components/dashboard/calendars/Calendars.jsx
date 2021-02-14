import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import CalendarEditView from './CalendarEditView';
import CalendarSelectionDialog from './CalendarSelectionDialog';
import ConnectedAccount from './ConnectedAccount';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';
import {
  selectCalendarIds,
  selectCalendarsAreFetching,
  selectSystemNoficationsEnabled,
} from '../../../modules/calendars';
import {
  selectGapiUserSignedIn,
  selectGapiHasAllCalendarScopes,
  selectGoogleFirebaseAuthProvider,
} from '../../../modules/session';
import useDelayedState from '../../hooks/useDelayedState';
import GoogleButton from '../../ui/GoogleButton';
import LoaderScreen from '../../ui/LoaderScreen';

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    padding: `${theme.spacing(4)}px ${theme.spacing(6)}px`,
    flexGrow: 1,
    width: '35rem',
    maxWidth: '100vw',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    alignSelf: 'center',
    overflow: 'auto',
  },
  list: {
    flexGrow: 1,
  },
}));

const Calendars = () => {
  const classes = useStyles();

  const connectNewCalendarButton = useRef();

  const googleSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);

  const [newCalendarMenuOpen, setNewCalendarMenuOpen] = useState(false);
  const [signingInToGoogle, setSigningInToGoogle] = useState(false);

  const calendarsAreFetching = useSelector(selectCalendarsAreFetching);
  const calendarIds = useSelector(selectCalendarIds);
  const anyCalendarHasDesktopNotifications = useSelector(
    (state) =>
      calendarIds.length > 0 && calendarIds.find((id) => selectSystemNoficationsEnabled(state, id)),
  );

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const { signInToConnectGoogleAccount } = useGoogleApiSignIn();

  const showLoader = useDelayedState(calendarsAreFetching, 500) && calendarsAreFetching;

  const handleSignInWithGoogle = () => {
    setSigningInToGoogle(true);
    signInToConnectGoogleAccount().then(
      () => setSigningInToGoogle(false),
      () => setSigningInToGoogle(false),
    );
  };

  return (
    <Box className={classes.mainContainer}>
      <Box mb={6}>
        <Typography variant="h6" component="h3" paragraph>
          Connected Account
        </Typography>

        {googleFirebaseAuthProvider ? (
          <List>
            <ConnectedAccount
              uid={googleFirebaseAuthProvider.uid}
              providerId={googleFirebaseAuthProvider.providerId}
              imageUrl={googleFirebaseAuthProvider.photoURL}
              name={googleFirebaseAuthProvider.displayName}
              email={googleFirebaseAuthProvider.email}
            />
          </List>
        ) : (
          <Typography paragraph>No account connected</Typography>
        )}

        {!googleFirebaseAuthProvider && (
          <Box display="flex" alignItems="center" flexDirection="column">
            <Box display="flex" justifyContent="center">
              <GoogleButton
                onClick={handleSignInWithGoogle}
                endIcon={
                  signingInToGoogle && (
                    <CircularProgress color="inherit" thickness={6} size="1rem" />
                  )
                }
              >
                Sign in with Google
              </GoogleButton>
            </Box>
          </Box>
        )}
      </Box>

      <Box mb={6}>
        <Typography variant="h6" component="h3" paragraph>
          Connected Calendars
        </Typography>
        <Box display="flex" justifyContent="center">
          {cond([
            [() => showLoader, () => <LoaderScreen size="small" />],
            [() => calendarsAreFetching, () => null],
            [
              () => calendarIds.length === 0,
              () => <Typography paragraph>No calendars connected</Typography>,
            ],
            [
              () => true,
              () => (
                <Box width="100%">
                  {anyCalendarHasDesktopNotifications && !('Notification' in window) && (
                    <Alert variant="outlined" severity="warning">
                      {`This browser doesn't support desktop notifications `}
                    </Alert>
                  )}
                  {anyCalendarHasDesktopNotifications &&
                    'Notification' in window &&
                    Notification.permission !== 'granted' && (
                      <Alert variant="outlined" severity="warning">
                        This browser currently blocks desktop notifications
                      </Alert>
                    )}
                  <List className={classes.list}>
                    {calendarIds.map((calendarId, _, { length }) => (
                      <CalendarEditView key={calendarId} id={calendarId} count={length} />
                    ))}
                  </List>
                </Box>
              ),
            ],
          ])()}
        </Box>

        {!calendarsAreFetching && gapiHasAllCalendarScopes && (
          <Box display="flex" justifyContent="center">
            <Button
              ref={connectNewCalendarButton}
              variant="contained"
              color="primary"
              disabled={!googleSignedIn}
              onClick={() => setNewCalendarMenuOpen(!newCalendarMenuOpen)}
            >
              Add a calendar
            </Button>

            <CalendarSelectionDialog
              open={newCalendarMenuOpen}
              onClose={() => setNewCalendarMenuOpen(false)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Calendars;
