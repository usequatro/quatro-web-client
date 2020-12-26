import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';

import CalendarEditView from './CalendarEditView';
import CalendarSelectionDialog from './CalendarSelectionDialog';
import ConnectedAccount from './ConnectedAccount';
import { gapiSignInExistingUser } from '../../../googleApi';
import { firebaseConnectGoogleAccount } from '../../../firebase';
import { useNotification } from '../../Notification';
import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import { selectGapiUserSignedIn, selectGoogleFirebaseAuthProvider } from '../../../modules/session';
import useDebouncedState from '../../hooks/useDebouncedState';
import GoogleButton from '../../ui/GoogleButton';
import LoaderScreen from '../../ui/LoaderScreen';

const useStyles = makeStyles(() => ({
  list: {
    flexGrow: 1,
  },
}));

const Calendars = () => {
  const classes = useStyles();
  const { notifyError } = useNotification();

  const connectNewCalendarButton = useRef();

  const googleSignedIn = useSelector(selectGapiUserSignedIn);

  const [newCalendarMenuOpen, setNewCalendarMenuOpen] = useState(false);

  const calendarsAreFetching = useSelector(selectCalendarsAreFetching);
  const calendarIds = useSelector(selectCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const handleConnectGoogle = () => {
    firebaseConnectGoogleAccount().catch((error) => {
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

  const showLoader = useDebouncedState(calendarsAreFetching, 500) && calendarsAreFetching;

  return (
    <Box
      my={4}
      mx={6}
      flexGrow={1}
      width="30rem"
      maxWidth="100%"
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      alignSelf="center"
    >
      <Box mb={6}>
        <Typography variant="h5" component="h3" paragraph>
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
        {!googleSignedIn && (
          <Box display="flex" alignItems="center" flexDirection="column">
            <Box display="flex" justifyContent="center">
              <GoogleButton
                onClick={
                  googleFirebaseAuthProvider ? handleSignInExistingUser : handleConnectGoogle
                }
              >
                Sign in with Google
              </GoogleButton>
            </Box>
          </Box>
        )}
      </Box>

      <Box mb={6}>
        <Typography variant="h5" component="h3" paragraph>
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
                <List className={classes.list}>
                  {calendarIds.map((calendarId) => (
                    <CalendarEditView key={calendarId} id={calendarId} />
                  ))}
                </List>
              ),
            ],
          ])()}
        </Box>

        {!calendarsAreFetching && (
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
