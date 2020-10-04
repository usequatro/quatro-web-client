import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';

import DateFnsUtils from '@date-io/date-fns';
import { Calendar, MuiPickersUtilsProvider } from '@material-ui/pickers';

import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';

import TimePicker from './TimePicker';
import LabeledIconButton from './LabeledIconButton';

const DateTimeDialog = ({ id, label, open, onClose, value, onChangeCommitted, initialDate }) => {
  const [currentValue, setCurrentValue] = useState(value || initialDate);

  useEffect(() => {
    if (value !== currentValue && value !== null) {
      setCurrentValue(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={id}
    >
      <DialogTitle id={id}>{label}</DialogTitle>

      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Calendar
            date={currentValue ? new Date(currentValue) : initialDate}
            onChange={(newDate) => setCurrentValue(newDate.getTime())}
          />
        </MuiPickersUtilsProvider>

        <Box display="flex" justifyContent="stretch" flexDirection="column">
          <TimePicker
            dateTime={currentValue}
            format="h:mm a"
            onChangeCommitted={(newTime) => {
              if (newTime) {
                const updatedDate = new Date(currentValue || initialDate);
                updatedDate.setHours(newTime.getHours());
                updatedDate.setMinutes(newTime.getMinutes());
                setCurrentValue(updatedDate.getTime());
              } else {
                const updatedDate = new Date(currentValue);
                updatedDate.setHours(initialDate.getHours());
                updatedDate.setMinutes(initialDate.getMinutes());
                setCurrentValue(updatedDate.getTime());
              }
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Box flexGrow={1}>
          <LabeledIconButton
            color="background.secondary"
            label="Clear"
            icon={<ClearRoundedIcon />}
            onClick={() => {
              onClose();
              onChangeCommitted(null);
            }}
          />
        </Box>

        <LabeledIconButton
          color="background.secondary"
          label="Done"
          icon={<SendRoundedIcon />}
          onClick={() => {
            onClose();
            onChangeCommitted(currentValue);
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

DateTimeDialog.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  value: PropTypes.number,
  onChangeCommitted: PropTypes.func.isRequired,
  initialDate: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
}

DateTimeDialog.defaultProps = {
  value: null,
}

export default DateTimeDialog;
