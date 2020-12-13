import React, { useState } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { useSelector, useDispatch } from 'react-redux';

import ListItem from '@material-ui/core/ListItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';

import {
  selectCalendarName,
  selectCalendarColor,
  selectCalendarProviderCalendarId,
} from '../../../modules/calendars';
import { clearEvents } from '../../../modules/calendarEvents';
import { fetchUpdateCalendar, fetchDeleteCalendar } from '../../../utils/apiClient';
import { TextFieldWithTypography } from '../../ui/InputWithTypography';
import LabeledIconButton from '../../ui/LabeledIconButton';
import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import calendarColors from '../../../constants/calendarColors';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
    display: 'flex',
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

const CalendarEditView = ({ id, calendarsAvailable }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const colorSelectorClasses = useColorSelectorStyles();

  const name = useSelector((state) => selectCalendarName(state, id));
  const color = useSelector((state) => selectCalendarColor(state, id));
  const providerCalendarId = useSelector((state) => selectCalendarProviderCalendarId(state, id));

  const nameInProvider = get(
    (calendarsAvailable || []).find(
      (calendar) => calendar.providerCalendarId === providerCalendarId,
    ),
    'summary',
  );

  const [currentName, setCurrentName] = useState(name);

  return (
    <ListItem className={classes.container}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5} className={classes.nameContainer}>
          <Typography variant="body2">{nameInProvider}</Typography>

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
        </Grid>
        <Grid item xs={8} md={4} container justify="center">
          <FormControl component="fieldset">
            <FormLabel component="legend">Color</FormLabel>
            <RadioGroup row>
              {Object.values(colors).map(({ key, value }) => {
                return (
                  <FormControlLabel
                    key={key}
                    value={value}
                    checked={color === value}
                    onClick={() => fetchUpdateCalendar(id, { color: value })}
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
        </Grid>
        <Grid item container xs={4} md={3} justify="flex-end">
          <Confirm
            onConfirm={() => {
              dispatch(clearEvents());
              fetchDeleteCalendar(id);
            }}
            renderDialog={(open, onConfirm, onConfirmationClose) => (
              <ConfirmationDialog
                open={open}
                onClose={onConfirmationClose}
                onConfirm={onConfirm}
                id="confirm-disconnect-calendar"
                title="Disconnect calendar"
                body={`Are you sure you want to disconnect the calendar ${
                  currentName || nameInProvider
                }`}
                buttonText="Disconnect"
              />
            )}
            renderContent={(onClick) => (
              <LabeledIconButton
                color="background.secondary"
                label="Disconnect"
                icon={<ClearRoundedIcon />}
                onClick={onClick}
              />
            )}
          />
        </Grid>
      </Grid>
    </ListItem>
  );
};

CalendarEditView.propTypes = {
  calendarsAvailable: PropTypes.arrayOf(
    PropTypes.shape({
      providerCalendarId: PropTypes.string,
    }),
  ).isRequired,
  id: PropTypes.string.isRequired,
};

export default CalendarEditView;
