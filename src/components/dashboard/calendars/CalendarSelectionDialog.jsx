import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import cond from 'lodash/cond';
import sortBy from 'lodash/sortBy';

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

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import { useMixpanel } from '../../tracking/MixpanelContext';
import { useNotification } from '../../Notification';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import LoaderScreen from '../../ui/LoaderScreen';
import { selectAllConnectedProviderCalendarIds } from '../../../modules/calendars';
import { selectUserId, selectGapiUserSignedIn } from '../../../modules/session';
import { fetchCreateCalendar, fetchUpdateUserExternalConfig } from '../../../utils/apiClient';
import calendarColors from '../../../constants/calendarColors';
import { gapiListCalendars, gapiGetAuthInstance } from '../../../googleApi';
import * as paths from '../../../constants/paths';
import { GOOGLE_CALENDAR_CONNECTED } from '../../../constants/mixpanelEvents';

const keepAlphanumericChars = (string) => string.replace(/[^a-z0-9]/gi, '');

const ACCESS_OWNER = 'owner';
const ACCESS_READER = 'reader';
const ACCESS_WRITER = 'writer';
const ACCESS_FREE_BUSY_READER = 'freeBusyReader';

const ACCESS_COPY = {
  [ACCESS_OWNER]: 'Owner',
  [ACCESS_READER]: 'Read access',
  [ACCESS_WRITER]: 'Write access',
  [ACCESS_FREE_BUSY_READER]: 'See free/busy access',
};

export default function CalendarSelectionDialog({ open, onClose }) {
  const { notifyError, notifyInfo } = useNotification();
  const history = useHistory();
  const googleSignedIn = useSelector(selectGapiUserSignedIn);

  const connectedProviderCalendarIds = useSelector(selectAllConnectedProviderCalendarIds);
  const userId = useSelector(selectUserId);

  const [fetching, setFetching] = useState(false);
  const [calendarsAvailable, setCalendarsAvailable] = useState([]);
  const [calendarProviderIdsSelected, setCalendarProviderIdsSelected] = useState([]);

  useEffect(() => {
    if (!open) {
      setCalendarProviderIdsSelected([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !googleSignedIn) {
      return undefined;
    }
    let unsubscribed = false;
    setFetching(true);

    gapiListCalendars()
      .then((response) => {
        if (unsubscribed) {
          return;
        }

        const sort = (items) => sortBy(items, 'summary');

        const primaryItems = response.result.items.filter((item) => item.primary);
        const restItems = response.result.items.filter((item) => !item.primary);

        const sortedItems = [
          ...sort(primaryItems),
          ...sort(restItems.filter((i) => i.accessRole === ACCESS_OWNER)),
          ...sort(restItems.filter((i) => i.accessRole === ACCESS_WRITER)),
          ...sort(restItems.filter((i) => i.accessRole === ACCESS_READER)),
          ...sort(restItems.filter((i) => i.accessRole === ACCESS_FREE_BUSY_READER)),
        ];

        setCalendarsAvailable(sortedItems);
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
  }, [open, googleSignedIn, notifyError]);

  const mixpanel = useMixpanel();

  const handleConnect = async () => {
    const currentUser = (await gapiGetAuthInstance()).currentUser.get();
    if (!currentUser) {
      notifyError(`An error ocurred. User isn't signed in to Google`);
      return;
    }
    if (calendarProviderIdsSelected.length <= 0) {
      return;
    }

    const newDefaultCalendarProviderId =
      connectedProviderCalendarIds.length === 0 ? calendarProviderIdsSelected[0] : undefined;

    const promises = calendarProviderIdsSelected.map((calendarProviderId) => {
      const calendar = calendarsAvailable.find(({ id }) => id === calendarProviderId);
      if (!calendar) {
        console.error('No calendar'); // eslint-disable-line no-console
        notifyError(`An error ocurred adding ${calendarProviderId}`);
        return undefined;
      }

      return fetchCreateCalendar({
        providerCalendarId: calendar.id,
        userId,
        provider: 'google',
        providerUserId: currentUser.getId(),
        providerUserEmail: currentUser.getBasicProfile().getEmail(),
        color: calendarColors[0],
        name: calendar.summary,
      }).then((data) => {
        // We mark the first calendar created as default
        if (calendarProviderId === newDefaultCalendarProviderId) {
          return fetchUpdateUserExternalConfig({ defaultCalendarId: data.id });
        }
        return undefined;
      });
    });

    const validPromises = promises.filter(Boolean);
    Promise.all(validPromises).then(() => {
      notifyInfo({
        message: validPromises.length > 1 ? 'Calendars connected' : 'Calendar connected',
        buttons: [
          {
            children: 'Go to Top 4',
            onClick: () => {
              history.push(paths.NOW);
            },
          },
        ],
      });

      mixpanel.track(GOOGLE_CALENDAR_CONNECTED, {
        newCalendarsConnected: calendarProviderIdsSelected.length,
      });
    });

    onClose();
  };

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
          [() => fetching, () => <LoaderScreen size="small" />],
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
                  const selected =
                    alreadyAdded || calendarProviderIdsSelected.includes(calendar.id);
                  return (
                    <ListItem key={calendar.id} disabled={alreadyAdded}>
                      <ListItemText
                        style={{ wordBreak: 'break-word' }}
                        primary={calendar.summary}
                        secondary={[calendar.description, ACCESS_COPY[calendar.accessRole]]
                          .filter(Boolean)
                          .join(' - ')}
                        primaryTypographyProps={{
                          title: calendar.id,
                          component: 'label',
                          htmlFor: `button-select-${keepAlphanumericChars(calendar.id)}`,
                        }}
                        secondaryTypographyProps={{
                          component: 'label',
                          htmlFor: `button-select-${keepAlphanumericChars(calendar.id)}`,
                        }}
                      />

                      <ListItemSecondaryAction>
                        <IconButton
                          id={`button-select-${keepAlphanumericChars(calendar.id)}`}
                          aria-label="select"
                          title={calendar.id}
                          edge="end"
                          color={selected ? 'primary' : 'default'}
                          disabled={alreadyAdded}
                          onClick={() =>
                            selected
                              ? setCalendarProviderIdsSelected((ids) =>
                                  ids.filter((i) => i !== calendar.id),
                                )
                              : setCalendarProviderIdsSelected((ids) => ids.concat(calendar.id))
                          }
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
          disabled={fetching || calendarProviderIdsSelected.length === 0}
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
