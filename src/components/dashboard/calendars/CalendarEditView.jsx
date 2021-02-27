import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import ListItem from '@material-ui/core/ListItem';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { useNotification } from '../../Notification';
import { useMixpanel } from '../../tracking/MixpanelContext';
import {
  selectCalendarName,
  selectCalendarColor,
  selectCalendarProviderCalendarId,
  selectCalendarProviderUserId,
  selectCalendarProviderUserEmail,
  selectSystemNoficationsEnabled,
  selectSystemNoficationsMinutesInAdvance,
} from '../../../modules/calendars';
import { selectGapiUserId } from '../../../modules/session';
import { selectUserDefaultCalendarId } from '../../../modules/userExternalConfig';
import { clearAllEvents } from '../../../modules/calendarEvents';
import {
  fetchUpdateCalendar,
  fetchDeleteCalendar,
  fetchUpdateUserExternalConfig,
} from '../../../utils/apiClient';
import { TextFieldWithTypography } from '../../ui/InputWithTypography';
import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import calendarColors from '../../../constants/calendarColors';
import {
  GOOGLE_CALENDAR_DISCONNECTED,
  GOOGLE_CALENDAR_COLOR_CHANGED,
} from '../../../constants/mixpanelEvents';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: theme.spacing(4),
  },
}));

// example: { value: '#263573', key: '263573' },
const colors = calendarColors.map((calendarColor) => ({
  value: calendarColor,
  key: calendarColor.replace(/[^0-9a-z]/i, ''),
}));

const useColorSelectorStyles = makeStyles(() =>
  colors.reduce(
    (memo, { value, key }) => ({
      ...memo,
      [key]: {
        color: value,
      },
      [`checked-${key}`]: {
        color: `${value} !important`,
      },
    }),
    {},
  ),
);

const ColorPicker = ({ calendarId, color, isCalendarUserSignedUpWithGoogle }) => {
  const mixpanel = useMixpanel();
  const colorSelectorClasses = useColorSelectorStyles();

  return (
    <FormControl component="fieldset" aria-label="color">
      <RadioGroup
        row
        onChange={(event) => {
          const newColor = event.target.value;
          fetchUpdateCalendar(calendarId, { color: newColor });
          mixpanel.track(GOOGLE_CALENDAR_COLOR_CHANGED, { color: newColor });
        }}
      >
        {colors.map(({ key, value }, index, { length }) => {
          return (
            <FormControlLabel
              key={key}
              value={value}
              checked={color === value}
              disabled={!isCalendarUserSignedUpWithGoogle}
              control={
                <Radio
                  edge={index === length - 1 ? 'end' : false}
                  size="small"
                  classes={{
                    root: colorSelectorClasses[key],
                    checked: colorSelectorClasses[`checked-${key}`],
                  }}
                  inputProps={{
                    'aria-label': `color ${key}`,
                    disabled: !isCalendarUserSignedUpWithGoogle,
                  }}
                />
              }
            />
          );
        })}
      </RadioGroup>
    </FormControl>
  );
};

ColorPicker.propTypes = {
  calendarId: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  isCalendarUserSignedUpWithGoogle: PropTypes.bool.isRequired,
};

const DisconnectButton = ({
  calendarId,
  calendarDisplayName,
  isCalendarUserSignedUpWithGoogle,
}) => {
  const { notifyInfo } = useNotification();
  const dispatch = useDispatch();
  const mixpanel = useMixpanel();

  return (
    <Confirm
      onConfirm={() => {
        dispatch(clearAllEvents());
        fetchDeleteCalendar(calendarId);
        mixpanel.track(GOOGLE_CALENDAR_DISCONNECTED);
        notifyInfo('Calendar disconnected');
      }}
      renderDialog={(open, onConfirm, onConfirmationClose) => (
        <ConfirmationDialog
          open={open}
          onClose={onConfirmationClose}
          onConfirm={onConfirm}
          id="confirm-disconnect-calendar"
          title="Disconnect calendar confirmation"
          body={[
            `Are you sure you want to disconnect the calendar ${calendarDisplayName}?`,
            `Tasks will be unlinked from it and events in your calendar created from Quatro will be deleted.`,
            `You'll be able to connect it again later.`,
          ]}
          buttonText="Disconnect"
        />
      )}
      renderContent={(onClick) => (
        <Button onClick={onClick} size="small" variant="outlined">
          {isCalendarUserSignedUpWithGoogle ? 'Disconnect' : 'Remove'}
        </Button>
      )}
    />
  );
};

DisconnectButton.propTypes = {
  calendarId: PropTypes.string.isRequired,
  calendarDisplayName: PropTypes.string.isRequired,
  isCalendarUserSignedUpWithGoogle: PropTypes.bool.isRequired,
};

const CalendarNameInput = ({ calendarId, name, isCalendarUserSignedUpWithGoogle, helperText }) => {
  const [currentName, setCurrentName] = useState(name);

  return (
    <TextFieldWithTypography
      typography="body1"
      fullWidth
      disabled={!isCalendarUserSignedUpWithGoogle}
      value={currentName}
      onChange={(e) => {
        setCurrentName(e.target.value);
        if (e.target.value) {
          fetchUpdateCalendar(calendarId, { name: e.target.value });
        }
      }}
      required
      placeholder="Calendar name"
      aria-label="Calendar name"
      helperText={helperText !== name ? helperText : undefined}
    />
  );
};

CalendarNameInput.propTypes = {
  calendarId: PropTypes.string.isRequired,
  helperText: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isCalendarUserSignedUpWithGoogle: PropTypes.bool.isRequired,
};

const INTERVALS = [0, 1, 5, 10, 15, 30];

const CalendarEditView = ({ id, count }) => {
  const classes = useStyles();

  const name = useSelector((state) => selectCalendarName(state, id));
  const color = useSelector((state) => selectCalendarColor(state, id));
  const providerCalendarId = useSelector((state) => selectCalendarProviderCalendarId(state, id));
  const providerUserId = useSelector((state) => selectCalendarProviderUserId(state, id));
  const providerUserEmail = useSelector((state) => selectCalendarProviderUserEmail(state, id));
  const systemNotificationsEnabled = useSelector(
    (state) => selectSystemNoficationsEnabled(state, id) || false,
  );
  const systemNotificationsMinutesInAdvance = useSelector((state) =>
    selectSystemNoficationsMinutesInAdvance(state, id),
  );
  const gapiUserId = useSelector(selectGapiUserId);

  const defaultCalendarId = useSelector(selectUserDefaultCalendarId);

  const isCalendarUserSignedUpWithGoogle = gapiUserId === providerUserId;

  return (
    <ListItem className={classes.container} disableGutters data-id={id}>
      <Box pb={2}>
        {!isCalendarUserSignedUpWithGoogle && (
          <Typography variant="body2" color="error">
            {`Offline. Need to sign in with Google to ${providerUserEmail}`}
          </Typography>
        )}
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end" pt={2} flexWrap="wrap">
        <Box flexGrow={1} pr={2}>
          <CalendarNameInput
            calendarId={id}
            name={name}
            isCalendarUserSignedUpWithGoogle={isCalendarUserSignedUpWithGoogle}
            helperText={providerCalendarId}
          />
        </Box>
        <ColorPicker
          calendarId={id}
          color={color}
          isCalendarUserSignedUpWithGoogle={isCalendarUserSignedUpWithGoogle}
        />
      </Box>

      <Box pb={2} />

      <Box display="flex" alignItems="center" justifyContent="flex-end" pt={2} flexWrap="wrap">
        <Box display="flex" flexDirection="column" flexGrow={1}>
          {count > 1 && (
            <FormControlLabel
              label="Set as default"
              control={
                <Switch
                  checked={defaultCalendarId === id || count === 1}
                  onChange={() => {
                    fetchUpdateUserExternalConfig({ defaultCalendarId: id });
                  }}
                  name="defaultCalendar"
                  color="primary"
                />
              }
            />
          )}

          <Box display="flex" alignItems="center">
            <FormControlLabel
              label="Desktop notifications"
              control={
                <Switch
                  checked={systemNotificationsEnabled}
                  onChange={(event) => {
                    fetchUpdateCalendar(id, {
                      systemNotifications: {
                        enabled: Boolean(event.target.checked),
                      },
                    });
                  }}
                  name="defaultCalendar"
                  color="primary"
                />
              }
            />

            {systemNotificationsEnabled && (
              <Select
                aria-label="Minutes in advance for notification"
                value={systemNotificationsMinutesInAdvance}
                displayEmpty
                onChange={(event) => {
                  fetchUpdateCalendar(id, {
                    systemNotifications: {
                      minutesInAdvance: parseInt(event.target.value, 10),
                    },
                  });
                }}
              >
                {INTERVALS.map((interval) => (
                  <MenuItem value={interval} key={interval}>
                    {`${interval} min before`}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        </Box>

        <DisconnectButton
          calendarId={id}
          calendarDisplayName={name || providerCalendarId}
          isCalendarUserSignedUpWithGoogle={isCalendarUserSignedUpWithGoogle}
        />
      </Box>
    </ListItem>
  );
};

CalendarEditView.propTypes = {
  id: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

CalendarEditView.defaultProps = {};

export default CalendarEditView;
