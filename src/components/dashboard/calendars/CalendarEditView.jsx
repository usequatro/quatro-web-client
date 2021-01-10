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
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { useMixpanel } from '../../tracking/MixpanelContext';
import {
  selectCalendarName,
  selectCalendarColor,
  selectCalendarProviderCalendarId,
  selectCalendarProviderUserId,
  selectCalendarProviderUserEmail,
} from '../../../modules/calendars';
import { selectGapiUserId } from '../../../modules/session';
import { clearAllEvents } from '../../../modules/calendarEvents';
import { fetchUpdateCalendar, fetchDeleteCalendar } from '../../../utils/apiClient';
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

const CalendarEditView = ({ id }) => {
  const mixpanel = useMixpanel();
  const dispatch = useDispatch();
  const classes = useStyles();
  const colorSelectorClasses = useColorSelectorStyles();

  const name = useSelector((state) => selectCalendarName(state, id));
  const color = useSelector((state) => selectCalendarColor(state, id));
  const providerCalendarId = useSelector((state) => selectCalendarProviderCalendarId(state, id));
  const providerUserId = useSelector((state) => selectCalendarProviderUserId(state, id));
  const providerUserEmail = useSelector((state) => selectCalendarProviderUserEmail(state, id));
  const gapiUserId = useSelector(selectGapiUserId);

  const [currentName, setCurrentName] = useState(name);

  const isCalendarUserSignedUpWithGoogle = gapiUserId === providerUserId;

  return (
    <ListItem className={classes.container} disableGutters data-id={id}>
      <Box pb={2}>
        <Typography variant="body2">{providerCalendarId}</Typography>

        {!isCalendarUserSignedUpWithGoogle && (
          <Typography variant="body2" color="error">
            {`Offline. Need to sign in with Google to ${providerUserEmail}`}
          </Typography>
        )}

        <TextFieldWithTypography
          typography="body1"
          fullWidth
          value={currentName}
          onChange={(e) => {
            setCurrentName(e.target.value);
            if (e.target.value) {
              fetchUpdateCalendar(id, { name: e.target.value });
            }
          }}
          required
          placeholder="Calendar name"
          aria-label="Calendar name"
        />
      </Box>

      <Box display="flex">
        <Box flexGrow={1}>
          <FormControl component="fieldset" aria-label="color">
            <RadioGroup row>
              {Object.values(colors).map(({ key, value }) => {
                return (
                  <FormControlLabel
                    key={key}
                    value={value}
                    checked={color === value}
                    onClick={() => {
                      fetchUpdateCalendar(id, { color: value });
                      mixpanel.track(GOOGLE_CALENDAR_COLOR_CHANGED, { color: value });
                    }}
                    control={
                      <Radio
                        classes={{
                          root: colorSelectorClasses[key],
                          checked: colorSelectorClasses[`checked-${key}`],
                        }}
                        inputProps={{ 'aria-label': `color ${key}` }}
                      />
                    }
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
        </Box>

        <Confirm
          onConfirm={() => {
            dispatch(clearAllEvents());
            fetchDeleteCalendar(id);
            mixpanel.track(GOOGLE_CALENDAR_DISCONNECTED);
          }}
          renderDialog={(open, onConfirm, onConfirmationClose) => (
            <ConfirmationDialog
              open={open}
              onClose={onConfirmationClose}
              onConfirm={onConfirm}
              id="confirm-disconnect-calendar"
              title="Disconnect calendar"
              body={`Are you sure you want to disconnect the calendar ${
                currentName || providerCalendarId
              }`}
              buttonText="Disconnect"
            />
          )}
          renderContent={(onClick) => (
            <Button onClick={onClick} size="small">
              {isCalendarUserSignedUpWithGoogle ? 'Disconnect' : 'Remove'}
            </Button>
          )}
        />
      </Box>
    </ListItem>
  );
};

CalendarEditView.propTypes = {
  id: PropTypes.string.isRequired,
};

CalendarEditView.defaultProps = {};

export default CalendarEditView;
