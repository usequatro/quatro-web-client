import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cond from 'lodash/cond';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import { useNotification } from '../../Notification';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import { selectAllConnectedProviderCalendarIds } from '../../../modules/calendars';
import { selectUserId, selectGapiUserSignedIn } from '../../../modules/session';
import { useGoogleAPI } from '../../GoogleAPI';
import { fetchCreateCalendar } from '../../../utils/apiClient';
import calendarColors from '../../../constants/calendarColors';
import useDebouncedState from '../../hooks/useDebouncedState';

export default function CalendarSelectionDialog({ open, onClose }) {
  const { gapi } = useGoogleAPI();
  const { notifyError } = useNotification();
  const googleSignedIn = useSelector(selectGapiUserSignedIn);

  const connectedProviderCalendarIds = useSelector(selectAllConnectedProviderCalendarIds);
  const userId = useSelector(selectUserId);

  const [fetching, setFetching] = useState(false);
  const [calendarsAvailable, setCalendarsAvailable] = useState([]);
  const [calendarIdsSelected, setCalendarIdsSelected] = useState([]);

  useEffect(() => {
    if (!open) {
      setFetching(false);
      setCalendarsAvailable([]);
      setCalendarIdsSelected([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !gapi || !googleSignedIn) {
      return undefined;
    }
    let unsubscribed = false;
    setFetching(true);
    gapi.client.calendar.calendarList
      .list({
        maxResults: 25,
        minAccessRole: 'writer',
      })
      .then((response) => {
        if (unsubscribed) {
          return;
        }
        setCalendarsAvailable(response.result.items);
        setFetching(false);
      })
      .catch((error) => {
        setFetching(false);
        console.error(error); // eslint-disable-line no-console
        notifyError(`An error ocurred while loading your calendars`);
      });
    return () => {
      unsubscribed = true;
    };
  }, [open, googleSignedIn, gapi, notifyError]);

  const handleConnect = () => {
    const currentUser = gapi.auth2.getAuthInstance().currentUser.get();
    if (!currentUser) {
      notifyError(`An error ocurred. User isn't signed in to Google`);
      return;
    }
    calendarIdsSelected.forEach((selectedCalendarId) => {
      const calendar = calendarsAvailable.find(({ id }) => id === selectedCalendarId);
      if (!calendar) {
        console.error('No calendar'); // eslint-disable-line no-console
        notifyError(`An error ocurred adding ${selectedCalendarId}`);
        return;
      }

      fetchCreateCalendar({
        providerCalendarId: calendar.id,
        userId,
        provider: 'google',
        providerUserId: currentUser.getId(),
        providerUserEmail: currentUser.getBasicProfile().getEmail(),
        color: calendarColors[0],
        name: calendar.summary,
      });
    });
    onClose();
  };

  // Introduce a delay before the spinner shows
  const showSpinner = useDebouncedState(fetching, 250) && fetching;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="add-a-calendar-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitleWithClose
        title="Add Calendar"
        onClose={onClose}
        TypographyProps={{ id: 'add-a-calendar-title', variant: 'h6' }}
      />
      <DialogContent>
        {cond([
          [
            () => showSpinner,
            () => (
              <Box display="flex" justifyContent="center">
                <CircularProgress thickness={3} size="1.5rem" color="inherit" />
              </Box>
            ),
          ],
          [
            () => calendarsAvailable.length === 0,
            () => <DialogContentText>No calendars</DialogContentText>,
          ],
          [
            () => true,
            () => (
              <List>
                {calendarsAvailable.map((calendar) => {
                  const alreadyAdded = connectedProviderCalendarIds.includes(calendar.id);
                  const selected = alreadyAdded || calendarIdsSelected.includes(calendar.id);
                  return (
                    <ListItem key={calendar.id} disabled={alreadyAdded}>
                      <ListItemText>{calendar.id}</ListItemText>
                      <ListItemSecondaryAction>
                        <IconButton
                          aria-label="select"
                          edge="end"
                          color={selected ? 'primary' : 'default'}
                          disabled={alreadyAdded}
                          onClick={() => {
                            return selected
                              ? setCalendarIdsSelected((ids) =>
                                  ids.filter((i) => i !== calendar.id),
                                )
                              : setCalendarIdsSelected((ids) => ids.concat(calendar.id));
                          }}
                        >
                          {selected ? (
                            <CheckCircleOutlineRoundedIcon fontSize="large" />
                          ) : (
                            <RadioButtonUncheckedRoundedIcon fontSize="large" />
                          )}
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            ),
          ],
        ])()}
      </DialogContent>

      <DialogActions>
        <Button
          disabled={fetching || calendarIdsSelected.length === 0}
          color="primary"
          variant="contained"
          onClick={handleConnect}
        >
          Connect
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CalendarSelectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
