import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import parse from 'date-fns/parse';
import formatFunction from 'date-fns/format';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';

import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';

const useStyles = makeStyles((theme) => ({
  timepickerNumber: {
    marginRight: theme.spacing(1),
    textAlign: 'center',
    width: '3rem',
  },
  input: {
    textAlign: 'center',
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&[type="number]': {
      '-moz-appearance': 'textfield',
    },
  },
  option: {
    padding: theme.spacing(1), // reducing a bit option paddings, so the menu is thinner
  },
}));

const HOURS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
const MINUTES = Array(60)
  .fill('')
  .map((e, i) => `${i < 10 ? '0' : ''}${i}`);
const MERIDIEMS = ['AM', 'PM'];

const parseSafe = (value, format, referenceTimestamp, fallback = null) => {
  if (!value) {
    return fallback;
  }
  try {
    return parse(value, format, referenceTimestamp).getTime();
  } catch (error) {
    return fallback;
  }
};

const getIsHourSelected = (option, value) => option === value;
const getIsMinuteSelected = (option, value) => option === value || option === `0${value}`;

const getApproximateHour = (inputValue) =>
  HOURS.find((option) => getIsHourSelected(option, inputValue));
const getApproximateMinute = (inputValue) =>
  MINUTES.find((option) => getIsMinuteSelected(option, inputValue));

const filterMinuteOptions = (options) =>
  options.filter(
    (option) => option === '00' || option === '15' || option === '30' || option === '45',
  );

const renderInput = (autocompleteParams, inputProps = {}) => {
  const params = {
    ...autocompleteParams,
    InputProps: {
      ...autocompleteParams.InputProps,
      endAdornment: undefined, // don't display arrow
    },
    inputProps: {
      ...autocompleteParams.inputProps,
      ...inputProps,
    },
  };
  return <TextField {...params} />;
};
const renderNumberInput = (autocompleteParams) =>
  renderInput(autocompleteParams, {
    type: 'number',
    pattern: '[0-9]*',
  });

const TimePicker = ({ timestamp, onChangeCommitted, showIcon }) => {
  const classes = useStyles();

  // Value is the selected value by Autocomplete
  const [hourValue, setHourValue] = useState(HOURS[10]);
  const [minuteValue, setMinuteValue] = useState(MINUTES[0]);
  const [meridiemValue, setMeridiemValue] = useState(MERIDIEMS[0]);

  // Input value is what shows on the input as the user types
  const [hourInputValue, setHourInputValue] = useState(hourValue);
  const [minuteInputValue, setMinuteInputValue] = useState(minuteValue);

  useEffect(() => {
    setHourValue(formatFunction(timestamp, 'h'));
    setMinuteValue(formatFunction(timestamp, 'mm'));
    setMeridiemValue(formatFunction(timestamp, 'a'));
    setHourInputValue(formatFunction(timestamp, 'h'));
    setMinuteInputValue(formatFunction(timestamp, 'mm'));
  }, [timestamp]);

  const handleChange = ({ hour, minute, meridiem }) => {
    if (hour) {
      setHourValue(hour);
    }
    if (minute) {
      setMinuteValue(minute);
    }
    if (meridiem) {
      setMeridiemValue(meridiem);
    }
    const newTimestamp = parseSafe(
      `${hour || hourValue}:${minute || minuteValue} ${meridiem || meridiemValue}`,
      'hh:mm a',
      timestamp,
    );
    onChangeCommitted(newTimestamp);
  };

  // Stop propagation because the @material-ui/pickers Calendar is picking it up
  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <Box display="flex" alignItems="center">
      {showIcon && (
        <Box mr={1}>
          <QueryBuilderRoundedIcon />
        </Box>
      )}

      <Autocomplete
        // common
        autoComplete
        disableClearable
        autoSelect
        forcePopupIcon={false}
        fullWidth
        onKeyDown={stopPropagation}
        // config
        options={HOURS}
        getOptionLabel={(option) => option}
        renderInput={renderNumberInput}
        getOptionSelected={getIsHourSelected}
        // control
        value={hourValue}
        onChange={(event, newValue) => handleChange({ hour: newValue })}
        inputValue={hourInputValue}
        onInputChange={(event, newInputValue) => setHourInputValue(newInputValue)}
        onBlur={(event) => {
          if (hourValue !== hourInputValue) {
            const value = getApproximateHour(event.target.value);
            if (value) {
              handleChange({ hour: value });
            }
          }
        }}
        // ui/ux
        classes={{ input: classes.input, option: classes.option, root: classes.timepickerNumber }}
      />

      <Autocomplete
        // common
        autoComplete
        disableClearable
        autoSelect
        forcePopupIcon={false}
        fullWidth
        onKeyDown={stopPropagation}
        // config
        options={MINUTES}
        getOptionLabel={(option) => option}
        renderInput={renderNumberInput}
        getOptionSelected={getIsMinuteSelected}
        filterOptions={filterMinuteOptions}
        // control
        value={minuteValue}
        onChange={(event, newValue) => handleChange({ minute: newValue })}
        inputValue={minuteInputValue}
        onInputChange={(event, newInputValue) => setMinuteInputValue(newInputValue)}
        onBlur={(event) => {
          if (minuteValue !== minuteInputValue) {
            const value = getApproximateMinute(event.target.value);
            if (value) {
              handleChange({ minute: value });
            }
          }
        }}
        // ui/ux
        classes={{ input: classes.input, option: classes.option, root: classes.timepickerNumber }}
      />

      <FormControl className={classes.formControl}>
        <Select
          aria-label="Meridiem"
          native
          value={meridiemValue}
          onChange={(event) => handleChange({ meridiem: event.target.value })}
          inputProps={{ name: 'meridiem' }}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </Select>
      </FormControl>
    </Box>
  );
};

TimePicker.propTypes = {
  showIcon: PropTypes.bool.isRequired,
  timestamp: PropTypes.number.isRequired,
  onChangeCommitted: PropTypes.func.isRequired,
};

export default TimePicker;
