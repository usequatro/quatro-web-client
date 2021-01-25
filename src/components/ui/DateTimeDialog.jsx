import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';

import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';

import TimePicker from './TimePicker';
import LabeledIconButton from './LabeledIconButton';
import DialogTitleWithClose from './DialogTitleWithClose';
import DatePicker from './DatePicker';

const DateTimeDialog = ({ id, label, open, onClose, value, onChangeCommitted, initialDate }) => {
  const [currentValue, setCurrentValue] = useState(value || initialDate);

  useEffect(() => {
    if (value !== currentValue && value !== null) {
      setCurrentValue(value);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby={id} fullWidth maxWidth="xs">
      <DialogTitleWithClose
        TypographyProps={{ id, variant: 'h6' }}
        title={label}
        onClose={onClose}
      />

      <DialogContent>
        <Box display="flex" justifyContent="center" mb={3}>
          <DatePicker
            timestamp={currentValue}
            onChange={(newTimestamp) => setCurrentValue(newTimestamp)}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <TimePicker
            timestamp={currentValue}
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
      <Divider light />
      <DialogActions>
        <Box flexGrow={1}>
          <LabeledIconButton
            color="inherit"
            label="Clear"
            icon={<ClearRoundedIcon />}
            onClick={() => {
              onClose();
              onChangeCommitted(null);
            }}
          />
        </Box>

        <LabeledIconButton
          label="Done"
          icon={<SendRoundedIcon />}
          color="primary"
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
};

DateTimeDialog.defaultProps = {
  value: null,
};

export default DateTimeDialog;
