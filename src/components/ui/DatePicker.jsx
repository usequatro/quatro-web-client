import React from 'react';
import PropTypes from 'prop-types';

import isToday from 'date-fns/isToday';
import set from 'date-fns/set';
import getYear from 'date-fns/getYear';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';
import enUsLocale from 'date-fns/locale/en-US';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import DateFnsUtils from '@date-io/date-fns';
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

import EventRoundedIcon from '@material-ui/icons/EventRounded';

const DatePickerTextFieldComponent = ({ inputProps, ...props }) => (
  <TextField {...props} inputProps={{ 'aria-label': 'Scheduled date', ...inputProps }} fullWidth />
);

DatePickerTextFieldComponent.propTypes = {
  inputProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
DatePickerTextFieldComponent.defaultProps = {
  inputProps: {},
};

const enUsLocaleCustomized = {
  ...enUsLocale,
  options: {
    ...enUsLocale.options,
    weekStartsOn: 1,
  },
};

const DatePicker = ({ timestamp, onChange }) => {
  const handleSetToday = () => {
    const today = set(timestamp, {
      year: getYear(Date.now()),
      month: getMonth(Date.now()),
      date: getDate(Date.now()),
    });
    onChange(today.getTime());
  };

  return (
    <Box display="flex" width="100%" alignItems="center">
      <Box mr={1}>
        <EventRoundedIcon />
      </Box>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={enUsLocaleCustomized}>
        {/* <Calendar
            date={
              currentTimestamp ? new Date(currentTimestamp) : new Date(initialDateTimestamp)
            }
            onChange={(newDate) => setCurrentTimestamp(newDate.getTime())}
          /> */}
        <MuiDatePicker
          format="PPPP"
          value={timestamp ? new Date(timestamp) : new Date()}
          onChange={(newDate) => onChange(newDate.getTime())}
          animateYearScrolling
          TextFieldComponent={DatePickerTextFieldComponent}
        />
      </MuiPickersUtilsProvider>

      <Box ml={1}>
        <Button variant="text" disabled={isToday(timestamp)} onClick={handleSetToday}>
          Today
        </Button>
      </Box>
    </Box>
  );
};

DatePicker.propTypes = {
  timestamp: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DatePicker;
