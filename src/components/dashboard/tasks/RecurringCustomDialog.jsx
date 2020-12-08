import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import isMonday from 'date-fns/isMonday';
import isTuesday from 'date-fns/isTuesday';
import isWednesday from 'date-fns/isWednesday';
import isThursday from 'date-fns/isThursday';
import isFriday from 'date-fns/isFriday';
import isSaturday from 'date-fns/isSaturday';
import isSunday from 'date-fns/isSunday';

import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import Input from '@material-ui/core/Input';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';

import SendRoundedIcon from '@material-ui/icons/SendRounded';

import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import LabeledIconButton from '../../ui/LabeledIconButton';
import { WEEK, MONTH, DAY } from '../../../constants/recurringDurationUnits';
import {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
} from '../../../constants/weekdays';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';

const hasActiveWeekdays = (activeWeekdays) =>
  Object.values(activeWeekdays).reduce((memo, value) => memo || value, false);

const useStyles = makeStyles((theme) => ({
  paper: {
    width: '25rem',
    maxWidth: '90vw',
  },
  amountInput: {
    width: '3rem',
    margin: `0 ${theme.spacing(2)}px`,
    '& input': {
      textAlign: 'center',
    },
  },
  weekdayButton: {
    marginRight: `0.2em`,
    width: '2.2em',
    lineHeight: 1,
    minWidth: 0,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
}));

const weekdayButtons = [
  { value: MONDAY, label: 'M', ariaLabel: 'Monday' },
  { value: TUESDAY, label: 'T', ariaLabel: 'Tuesday' },
  { value: WEDNESDAY, label: 'W', ariaLabel: 'Wednesday' },
  { value: THURSDAY, label: 'T', ariaLabel: 'Thursday' },
  { value: FRIDAY, label: 'F', ariaLabel: 'Friday' },
  { value: SATURDAY, label: 'S', ariaLabel: 'Saturday' },
  { value: SUNDAY, label: 'S', ariaLabel: 'Sunday' },
];

const RecurringCustomDialog = ({
  open,
  referenceDate,
  initialRecurringConfig,
  onClose,
  onDone,
}) => {
  const classes = useStyles();

  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState(WEEK);
  const [activeWeekdays, setActiveWeekdays] = useState({});

  useEffect(() => {
    if (open) {
      setAmount(get(initialRecurringConfig, 'amount', 1));
      setUnit(get(initialRecurringConfig, 'unit', WEEK));
      setActiveWeekdays(
        !isEmpty(get(initialRecurringConfig, 'activeWeekdays'))
          ? initialRecurringConfig.activeWeekdays
          : {
              [MONDAY]: isMonday(referenceDate),
              [TUESDAY]: isTuesday(referenceDate),
              [WEDNESDAY]: isWednesday(referenceDate),
              [THURSDAY]: isThursday(referenceDate),
              [FRIDAY]: isFriday(referenceDate),
              [SATURDAY]: isSaturday(referenceDate),
              [SUNDAY]: isSunday(referenceDate),
            },
      );
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const recurringConfig = {
    unit,
    amount,
    activeWeekdays: unit === WEEK ? activeWeekdays : {},
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="task-recurrence-custom-repeat-dialog"
      PaperProps={{
        className: classes.paper,
      }}
    >
      <DialogTitleWithClose id="task-recurrence-custom-repeat-dialog" onClose={onClose}>
        Custom Repeat
      </DialogTitleWithClose>

      <DialogContent>
        <Box mb={4} display="flex" flexDirection="row">
          <Box display="flex" alignItems="center">
            <Typography variant="body1">Repeat every</Typography>
          </Box>
          <Input
            type="number"
            min="1"
            max="1000"
            value={amount}
            onChange={(event) =>
              !Number.isNaN(parseInt(event.target.value, 10)) && event.target.value > 0
                ? setAmount(parseInt(event.target.value, 10))
                : undefined
            } // eslint-disable-line react/jsx-curly-newline
            className={classes.amountInput}
          />
          <Select value={unit} onChange={(event) => setUnit(event.target.value)}>
            <MenuItem value={DAY}>{amount === 1 ? 'day' : 'days'}</MenuItem>
            <MenuItem value={WEEK}>{amount === 1 ? 'week' : 'weeks'}</MenuItem>
            <MenuItem value={MONTH}>{amount === 1 ? 'month' : 'months'}</MenuItem>
          </Select>
        </Box>

        <Fade in={unit === WEEK} unmountOnExit>
          <Box mb={4} display="flex" flexDirection="column">
            <Typography variant="body1">Repeat every</Typography>
            <Box mt={2} display="flex">
              {weekdayButtons.map(({ value, label, ariaLabel }) => (
                <Button
                  key={value}
                  aria-label={ariaLabel}
                  size="large"
                  className={classes.weekdayButton}
                  variant={activeWeekdays[value] ? 'contained' : 'text'}
                  color={activeWeekdays[value] ? 'primary' : 'inherit'}
                  onClick={() => {
                    const newActiveWeekdays = {
                      ...activeWeekdays,
                      [value]: !activeWeekdays[value],
                    };
                    if (hasActiveWeekdays(newActiveWeekdays)) {
                      setActiveWeekdays(newActiveWeekdays);
                    }
                  }} // eslint-disable-line react/jsx-curly-newline
                >
                  {label}
                </Button>
              ))}
            </Box>
          </Box>
        </Fade>

        <Box mb={4}>{getUserFacingRecurringText(recurringConfig, referenceDate)}</Box>
      </DialogContent>

      <DialogActions>
        <LabeledIconButton
          color="background.secondary"
          label="Done"
          icon={<SendRoundedIcon />}
          onClick={() => {
            onClose();
            onDone(recurringConfig);
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

RecurringCustomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  referenceDate: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  initialRecurringConfig: PropTypes.shape({
    unit: PropTypes.string,
    amount: PropTypes.number,
    activeWeekdays: PropTypes.shape({
      [MONDAY]: PropTypes.bool,
      [TUESDAY]: PropTypes.bool,
      [WEDNESDAY]: PropTypes.bool,
      [THURSDAY]: PropTypes.bool,
      [FRIDAY]: PropTypes.bool,
      [SATURDAY]: PropTypes.bool,
      [SUNDAY]: PropTypes.bool,
    }),
  }),
};

RecurringCustomDialog.defaultProps = {
  initialRecurringConfig: undefined,
};

export default RecurringCustomDialog;
