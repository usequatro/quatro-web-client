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
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';

import CalendarEditView from './CalendarEditView';
import { fetchCreateCalendar } from '../../../utils/apiClient';
import { useGoogleAPI } from '../../GoogleAPI';
import {
  selectCalendarIds,
  selectAllConnectedProviderCalendarIds,
} from '../../../modules/calendars';
import { selectUserId } from '../../../modules/session';
import calendarColors from '../../../constants/calendarColors';

import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import LabeledIconButton from '../../ui/LabeledIconButton';
import GoogleButton from '../../ui/GoogleButton';

const useStyles = makeStyles(() => ({
  list: {
    flexGrow: 1,
  },
}));

const Calendars = () => {
  const classes = useStyles();

  const connectNewCalendarButton = useRef();

  const { isSignedIn, gapi, signIn } = useGoogleAPI();

  const [newCalendarMenuOpen, setNewCalendarMenuOpen] = useState(false);
  const [calendarsAvailable, setCalendarsAvailable] = useState([]);

  const calendarIds = useSelector(selectCalendarIds);
  const userId = useSelector(selectUserId);
  const connectedProviderCalendarIds = useSelector(selectAllConnectedProviderCalendarIds);

  useEffect(() => {
    if (!gapi || !isSignedIn) {
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
  }, [isSignedIn, gapi]);

  const handleSelectAvailableCalendar = ({ providerCalendarId, summary }) => {
    fetchCreateCalendar({
      providerCalendarId,
      userId,
      provider: 'google',
      color: calendarColors[0],
      name: summary,
    });
    setNewCalendarMenuOpen(false);
  };

  const [connectedGoogleAccount, setConnectedGoogleAccount] = useState(null);
  useEffect(() => {
    if (!gapi) {
      return;
    }
    if (isSignedIn && !connectedGoogleAccount) {
      const auth = gapi.auth2.getAuthInstance();
      // https://developers.google.com/identity/sign-in/web/reference#googleusergetbasicprofile
      const basicProfile = auth.currentUser.get().getBasicProfile();
      setConnectedGoogleAccount({
        name: basicProfile.getName(),
        imageUrl: basicProfile.getImageUrl(),
        email: basicProfile.getEmail(),
      });
    } else if (!isSignedIn && connectedGoogleAccount) {
      setConnectedGoogleAccount(null);
    }
  }, [gapi, isSignedIn, connectedGoogleAccount]);

  const revokeAccess = () => {
    const auth = gapi.auth2.getAuthInstance();
    auth.disconnect();
    auth.signOut();
  };

  return (
    <Box my={4} mx={6} flexGrow={1}>
      <Box mb={6}>
        <Typography variant="h5" component="h3" paragraph>
          Connected Calendars
        </Typography>
        <Box display="flex" justifyContent="center">
          {cond([
            [
              () => !isSignedIn || calendarIds.length === 0,
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
            disabled={!isSignedIn}
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

      <Box>
        <Typography variant="h5" component="h3" paragraph>
          Connected Accounts
        </Typography>
        {connectedGoogleAccount && (
          <List>
            <ListItem>
              {connectedGoogleAccount.imageUrl && (
                <ListItemAvatar>
                  <Avatar alt={connectedGoogleAccount.name} src={connectedGoogleAccount.imageUrl} />
                </ListItemAvatar>
              )}
              <ListItemText>{`${connectedGoogleAccount.name} - ${connectedGoogleAccount.email}`}</ListItemText>
              <ListItemSecondaryAction>
                <Confirm
                  onConfirm={() => revokeAccess()}
                  renderDialog={(open, onConfirm, onConfirmationClose) => (
                    <ConfirmationDialog
                      open={open}
                      onClose={onConfirmationClose}
                      onConfirm={onConfirm}
                      id="confirm-revoke-access"
                      title="Revoke access"
                      body="This action will revoke access to your calendars that you've previously granted. Your calendar will stop synching"
                      buttonText="Revoke access"
                    />
                  )}
                  renderContent={(onClick) => (
                    <LabeledIconButton
                      color="background.secondary"
                      label="Revoke access"
                      icon={<BlockRoundedIcon />}
                      onClick={onClick}
                    />
                  )}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        )}
        {!connectedGoogleAccount && (
          <Box display="flex" alignItems="center" flexDirection="column">
            <Typography paragraph>No accounts connected</Typography>
            <Box display="flex" justifyContent="center">
              <GoogleButton onClick={() => signIn()}>Sign in with Google</GoogleButton>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Calendars;
