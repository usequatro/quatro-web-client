import React from 'react';
import PropTypes from 'prop-types';
import format from 'date-fns/format';
import isMonday from 'date-fns/isMonday';
import isTuesday from 'date-fns/isTuesday';
import isWednesday from 'date-fns/isWednesday';
import isThursday from 'date-fns/isThursday';
import isFriday from 'date-fns/isFriday';
import isSaturday from 'date-fns/isSaturday';
import isSunday from 'date-fns/isSunday';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import { WEEK, MONTH, DAY } from '../../../constants/recurringDurationUnits';
import * as WEEKDAYS from '../../../constants/weekdays';

const useStyles = makeStyles(() => ({
  paper: {
    width: '25rem',
    maxWidth: '90vw',
  },
}));

const getPresetOptions = (referenceDate) =>
  [
    {
      label: "Don't repeat",
      config: null,
    },
    {
      label: 'Every day',
      config: {
        unit: DAY,
        amount: 1,
      },
    },
    {
      label: 'Every weekday (Monday to Friday)',
      config: {
        unit: WEEK,
        amount: 1,
        activeWeekdays: {
          [WEEKDAYS.MONDAY]: true,
          [WEEKDAYS.TUESDAY]: true,
          [WEEKDAYS.WEDNESDAY]: true,
          [WEEKDAYS.THURSDAY]: true,
          [WEEKDAYS.FRIDAY]: true,
          [WEEKDAYS.SATURDAY]: false,
          [WEEKDAYS.SUNDAY]: false,
        },
      },
    },
    referenceDate && {
      label: `Weekly every ${format(referenceDate, 'EEEE')}`,
      config: {
        unit: WEEK,
        amount: 1,
        activeWeekdays: {
          [WEEKDAYS.MONDAY]: isMonday(referenceDate),
          [WEEKDAYS.TUESDAY]: isTuesday(referenceDate),
          [WEEKDAYS.WEDNESDAY]: isWednesday(referenceDate),
          [WEEKDAYS.THURSDAY]: isThursday(referenceDate),
          [WEEKDAYS.FRIDAY]: isFriday(referenceDate),
          [WEEKDAYS.SATURDAY]: isSaturday(referenceDate),
          [WEEKDAYS.SUNDAY]: isSunday(referenceDate),
        },
      },
    },
    referenceDate && {
      label: `Monthy on the ${format(referenceDate, 'do')}`,
      config: {
        unit: MONTH,
        amount: 1,
      },
    },
  ].filter(Boolean);

const RecurringConfigDialog = ({ open, referenceDate, onClose, onRepeatConfigChange }) => {
  const classes = useStyles();

  const presetOptions = getPresetOptions(referenceDate);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="task-recurrence-dialog"
      PaperProps={{
        className: classes.paper,
      }}
    >
      <DialogTitle id="task-recurrence-dialog">Repeat</DialogTitle>

      <DialogContent>
        <MenuList>
          {presetOptions.map((preset) => (
            <MenuItem key={preset.label} onClick={() => onRepeatConfigChange(preset.config)}>
              {preset.label}
            </MenuItem>
          ))}
        </MenuList>
      </DialogContent>
    </Dialog>
  );
};

RecurringConfigDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  referenceDate: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onRepeatConfigChange: PropTypes.func.isRequired,
};

RecurringConfigDialog.defaultProps = {
  referenceDate: null,
};

export default RecurringConfigDialog;
