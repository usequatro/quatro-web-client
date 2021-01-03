import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';

const useStyles = makeStyles(() => ({
  durationInput: {
    '& input': {
      textAlign: 'center',
    },
    // @see https://www.w3schools.com/howto/howto_css_hide_arrow_number.asp
    '$ input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
  },
}));

const DEFAULT = 15;
const MIN = 5;
const STEP = 5;

const DurationField = ({ duration: passedDuration, onChange }) => {
  const classes = useStyles();
  const [duration, setDuration] = useState(passedDuration);

  const previousDuration = useRef(passedDuration);
  useEffect(() => {
    if (duration !== previousDuration.current) {
      previousDuration.current = duration;
      onChange(duration);
    }
  }, [duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLessButtonClick = () => {
    if (duration > MIN) {
      setDuration(duration - STEP);
    }
  };
  const handleMoreButtonClick = () => {
    setDuration(duration + STEP);
  };
  const handleChange = (event) => {
    if (!event.target.value) {
      setDuration('');
    }
    const number = parseInt(event.target.value, 10);
    if (Number.isNaN(number)) {
      return;
    }
    setDuration(number);
  };
  const handleBlur = () => {
    if (!duration) {
      setDuration(DEFAULT);
    } else if (duration < MIN) {
      setDuration(MIN);
    }
  };

  return (
    <FormControl>
      <InputLabel shrink htmlFor="duration-input">
        Duration
      </InputLabel>
      <Box display="flex" mt={2} alignItems="center">
        <IconButton size="small" onClick={handleLessButtonClick}>
          <RemoveRoundedIcon fontSize="small" />
        </IconButton>
        <Input
          id="duration-input"
          name="duration-input"
          type="number"
          className={classes.durationInput}
          fullWidth
          value={duration}
          onChange={handleChange}
          onBlur={handleBlur}
          endAdornment="m"
          inputProps={{ min: 5, step: 5 }}
          onKeyDown={(event) => {
            // Stop propagation because the calendar is picking it up
            event.stopPropagation();
          }}
        />
        <IconButton size="small" onClick={handleMoreButtonClick}>
          <AddRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </FormControl>
  );
};

DurationField.propTypes = {
  duration: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

DurationField.defaultProps = {};

export default DurationField;
