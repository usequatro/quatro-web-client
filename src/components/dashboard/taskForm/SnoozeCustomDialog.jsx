import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import addHours from 'date-fns/addHours';
import startOfTomorrow from 'date-fns/startOfTomorrow';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';

import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import SnoozeIcon from '@material-ui/icons/Snooze';

import TimePicker from '../../ui/TimePicker';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import DatePicker from '../../ui/DatePicker';

import { setSnoozedUntil, selectSnoozedUntil } from '../../../modules/taskForm';

const initialSnoozedUntilTimestamp = addHours(startOfTomorrow(), 9).getTime();

const SnoozeCustomDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const snoozedUntilTimestamp = useSelector(selectSnoozedUntil);

  const [currentValue, setCurrentValue] = useState(
    snoozedUntilTimestamp || initialSnoozedUntilTimestamp,
  );

  useEffect(() => {
    if (snoozedUntilTimestamp !== currentValue && snoozedUntilTimestamp !== null) {
      setCurrentValue(snoozedUntilTimestamp);
    }
  }, [snoozedUntilTimestamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeCommitted = (value) => {
    onClose();
    dispatch(setSnoozedUntil(value > Date.now() ? value : null));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="snooze-custom-dialog"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitleWithClose
        TypographyProps={{ id: 'snooze-custom-dialog', variant: 'h6' }}
        iconStart={<SnoozeIcon titleAccess="Snooze icon" />}
        title="Snooze"
        onClose={onClose}
      />

      <DialogContent>
        <Box display="flex" flexWrap="wrap">
          <Box flexGrow={1} flexShrink={0} pr={2} pb={2}>
            <DatePicker
              timestamp={currentValue}
              onChange={(newTimestamp) => setCurrentValue(newTimestamp)}
              disablePast
            />
          </Box>

          <Box pb={2}>
            <TimePicker
              showIcon={false}
              timestamp={currentValue}
              format="h:mm a"
              onChangeCommitted={(newTimestamp) => setCurrentValue(newTimestamp)}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Box flexGrow={1}>
          <Button
            variant="text"
            color="default"
            startIcon={<ClearRoundedIcon />}
            onClick={() => handleChangeCommitted(null)}
            style={{ textAlign: 'left' }}
          >
            Clear Snooze
          </Button>
        </Box>

        <Button variant="text" color="primary" onClick={() => handleChangeCommitted(currentValue)}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

SnoozeCustomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

SnoozeCustomDialog.defaultProps = {};

export default SnoozeCustomDialog;
