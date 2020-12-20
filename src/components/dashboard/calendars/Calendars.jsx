import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';

import CalendarEditView from './CalendarEditView';
import ConnectedAccount from './ConnectedAccount';
import { fetchCreateCalendar } from '../../../utils/apiClient';
import { useGoogleAPI } from '../../GoogleAPI';
import { useNotification } from '../../Notification';
import {
  selectCalendarIds,
  selectAllConnectedProviderCalendarIds,
} from '../../../modules/calendars';
import {
  selectUserId,
  selectGapiUserSignedIn,
  selectGoogleFirebaseAuthProvider,
} from '../../../modules/session';
import calendarColors from '../../../constants/calendarColors';

import GoogleButton from '../../ui/GoogleButton';

const useStyles = makeStyles(() => ({
  list: {
    flexGrow: 1,
  },
}));

const Calendars = () => {
  const classes = useStyles();
  const { notifyError } = useNotification();

  const connectNewCalendarButton = useRef();

  const { gapi, connectGoogle, signInExistingUser } = useGoogleAPI();
  const googleSignedIn = useSelector(selectGapiUserSignedIn);

  const [newCalendarMenuOpen, setNewCalendarMenuOpen] = useState(false);
  const [calendarsAvailable, setCalendarsAvailable] = useState([]);

  const calendarIds = useSelector(selectCalendarIds);
  const userId = useSelector(selectUserId);
  const connectedProviderCalendarIds = useSelector(selectAllConnectedProviderCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  useEffect(() => {
    if (!gapi || !googleSignedIn) {
      return;
    }
    gapi.client.calendar.calendarList
      .list({
        maxResults: 25,
        minAccessRole: 'writer',
      })
      .execute((response) => {
        setCalendarsAvailable(
          response.items.map((item) => ({
            providerCalendarId: item.id,
            summary: item.summary,
          })),
        );
      });
  }, [googleSignedIn, gapi]);

  const handleSelectAvailableCalendar = ({ providerCalendarId, summary }) => {
    const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
    if (!currentUser) {
      return;
    }
    fetchCreateCalendar({
      providerCalendarId,
      userId,
      provider: 'google',
      providerUserId: currentUser.getId(),
      providerUserEmail: currentUser.getBasicProfile().getEmail(),
      color: calendarColors[0],
      name: summary,
    });
    setNewCalendarMenuOpen(false);
  };

  const handleConnectGoogle = () => {
    connectGoogle().catch((error) => {
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
    <Box my={4} mx={6} flexGrow={1}>
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
            [
              () => calendarIds.length === 0,
              () => <Typography paragraph>No calendars connected</Typography>,
            ],
            [
              () => true,
              () => (
                <List className={classes.list}>
                  {calendarIds.map((calendarId) => (
                    <CalendarEditView
                      key={calendarId}
                      id={calendarId}
                      calendarsAvailable={calendarsAvailable}
                    />
                  ))}
                </List>
              ),
            ],
          ])()}
        </Box>

        <Box display="flex" justifyContent="center">
          <Button
            ref={connectNewCalendarButton}
            variant="contained"
            color="primary"
            disabled={!googleSignedIn}
            onClick={() => setNewCalendarMenuOpen(!newCalendarMenuOpen)}
          >
            Connect a calendar
          </Button>
          <Menu
            anchorEl={connectNewCalendarButton.current}
            open={newCalendarMenuOpen}
            onClose={() => setNewCalendarMenuOpen(false)}
          >
            {calendarsAvailable.map((calendar) => (
              <MenuItem
                key={calendar.providerCalendarId}
                disabled={connectedProviderCalendarIds.includes(calendar.providerCalendarId)}
                onClick={() => handleSelectAvailableCalendar(calendar)}
              >
                {calendar.providerCalendarId}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Calendars;
