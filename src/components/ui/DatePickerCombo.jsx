import React from 'react';
import PropTypes from 'prop-types';

import isToday from 'date-fns/isToday';
import set from 'date-fns/set';
import getYear from 'date-fns/getYear';
import getMonth from 'date-fns/getMonth';
import getDate from 'date-fns/getDate';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import EventRoundedIcon from '@material-ui/icons/EventRounded';

import DatePicker from './DatePicker';

const DatePickerCombo = ({ timestamp, disablePast, onChange }) => {
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

      <DatePicker timestamp={timestamp} disablePast={disablePast} onChange={onChange} />

      <Box ml={1}>
        <Button variant="outlined" disabled={isToday(timestamp)} onClick={handleSetToday}>
          Today
        </Button>
      </Box>
    </Box>
  );
};

DatePickerCombo.propTypes = {
  timestamp: PropTypes.number.isRequired,
  disablePast: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

DatePickerCombo.defaultProps = {
  disablePast: false,
};

export default DatePickerCombo;
