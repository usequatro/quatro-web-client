import React from 'react';
import PropTypes from 'prop-types';

import enUsLocale from 'date-fns/locale/en-US';
import getHours from 'date-fns/getHours';
import getMinutes from 'date-fns/getMinutes';
import getSeconds from 'date-fns/getSeconds';
import set from 'date-fns/set';

import TextField from '@material-ui/core/TextField';

import DateFnsUtils from '@date-io/date-fns';
import { DatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';

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

const DatePicker = ({ timestamp, onChange, ...props }) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={enUsLocaleCustomized}>
    <MuiDatePicker
      {...props}
      format="PPPP"
      value={timestamp ? new Date(timestamp) : new Date()}
      onChange={(newDate) => {
        const newDateWithSameTime = set(newDate, {
          hours: getHours(timestamp),
          minutes: getMinutes(timestamp),
          seconds: getSeconds(timestamp),
          milliseconds: 0,
        });
        onChange(newDateWithSameTime.getTime());
      }}
      animateYearScrolling
      TextFieldComponent={DatePickerTextFieldComponent}
      showTodayButton
      autoOk
    />
  </MuiPickersUtilsProvider>
);

DatePicker.propTypes = {
  timestamp: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

DatePicker.defaultProps = {};

export default DatePicker;
