import React from 'react';
import PropTypes from 'prop-types';

import enUsLocale from 'date-fns/locale/en-US';

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

const DatePicker = ({ timestamp, disablePast, onChange }) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={enUsLocaleCustomized}>
    <MuiDatePicker
      format="PPPP"
      value={timestamp ? new Date(timestamp) : new Date()}
      onChange={(newDate) => onChange(newDate.getTime())}
      animateYearScrolling
      disablePast={disablePast}
      TextFieldComponent={DatePickerTextFieldComponent}
    />
  </MuiPickersUtilsProvider>
);

DatePicker.propTypes = {
  timestamp: PropTypes.number.isRequired,
  disablePast: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

DatePicker.defaultProps = {
  disablePast: false,
};

export default DatePicker;
