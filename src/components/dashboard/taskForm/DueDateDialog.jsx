import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import addHours from 'date-fns/addHours';
import addWeeks from 'date-fns/addWeeks';
import startOfWeek from 'date-fns/startOfWeek';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';

import TimePicker from '../../ui/TimePicker';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import DatePicker from '../../ui/DatePicker';

import { setDue, selectDue } from '../../../modules/taskForm';

const initialDueDateTimestamp = addHours(addWeeks(startOfWeek(new Date()), 1), 9).getTime();

const DueDateDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const dueTimestamp = useSelector(selectDue);

  const [currentValue, setCurrentValue] = useState(dueTimestamp || initialDueDateTimestamp);

  useEffect(() => {
    if (dueTimestamp !== currentValue && dueTimestamp !== null) {
      setCurrentValue(dueTimestamp);
    }
  }, [dueTimestamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangeCommitted = (value) => {
    onClose();
    dispatch(setDue(value));
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="due-dialog" fullWidth maxWidth="xs">
      <DialogTitleWithClose
        TypographyProps={{ id: 'due-dialog', variant: 'h6' }}
        iconStart={<AccessAlarmRoundedIcon titleAccess="Due date icon" />}
        title="Due date"
        onClose={onClose}
      />

      <DialogContent>
        <Box display="flex" flexWrap="wrap" justifyContent="center" ml={0}>
          <Box flexGrow={1} flexShrink={0} pr={2} pb={2}>
            <DatePicker
              timestamp={currentValue}
              onChange={(newTimestamp) => setCurrentValue(newTimestamp)}
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
            {dueTimestamp ? 'Clear Due Date' : 'Cancel'}
          </Button>
        </Box>

        <Button variant="text" color="primary" onClick={() => handleChangeCommitted(currentValue)}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DueDateDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

DueDateDialog.defaultProps = {};

export default DueDateDialog;
