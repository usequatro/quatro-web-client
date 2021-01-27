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

const DateTimeDialog = ({
  id,
  label,
  open,
  onClose,
  timestamp,
  onChangeCommitted,
  initialTimestamp,
}) => {
  const [currentValue, setCurrentValue] = useState(timestamp || initialTimestamp);

  useEffect(() => {
    if (timestamp !== currentValue && timestamp !== null) {
      setCurrentValue(timestamp);
    }
  }, [timestamp]); // eslint-disable-line react-hooks/exhaustive-deps

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
                const updatedDate = new Date(currentValue || initialTimestamp);
                updatedDate.setHours(newTime.getHours());
                updatedDate.setMinutes(newTime.getMinutes());
                setCurrentValue(updatedDate.getTime());
              } else {
                const updatedDate = new Date(currentValue);
                const initialDate = new Date(initialTimestamp);
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
  timestamp: PropTypes.number,
  onChangeCommitted: PropTypes.func.isRequired,
  initialTimestamp: PropTypes.number.isRequired,
};

DateTimeDialog.defaultProps = {
  timestamp: null,
};

export default DateTimeDialog;
