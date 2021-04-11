import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import isFriday from 'date-fns/isFriday';
import isMonday from 'date-fns/isMonday';
import isSaturday from 'date-fns/isSaturday';
import isSunday from 'date-fns/isSunday';
import isThursday from 'date-fns/isThursday';
import isTuesday from 'date-fns/isTuesday';
import isWednesday from 'date-fns/isWednesday';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';

import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';

import {
  selectFormRecurringConfig,
  clearFormRecurringConfig,
  setFormRecurringConfigToPreset,
  setFormRecurringConfigActiveWeekdays,
  setFormRecurringConfigAmount,
  setFormRecurringConfigUnit,
  selectFormHasRecurringConfig,
  selectFormRecurringConfigUnit,
  selectFormRecurringConfigAmount,
  selectFormRecurringConfigActiveWeekdays,
} from '../../../modules/taskForm';

import { DAY, MONTH, WEEK } from '../../../constants/recurringDurationUnits';
import * as WEEKDAYS from '../../../constants/weekdays';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';

const getPresetOptions = (referenceDate) =>
  [
    {
      key: 'everyDay',
      config: {
        unit: DAY,
        amount: 1,
      },
    },
    {
      key: 'weekdays',
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
    {
      key: 'onceWeekly',
      config: {
        unit: WEEK,
        amount: 1,
        activeWeekdays: {
          [WEEKDAYS.MONDAY]: !referenceDate || isMonday(referenceDate),
          [WEEKDAYS.TUESDAY]: referenceDate && isTuesday(referenceDate),
          [WEEKDAYS.WEDNESDAY]: referenceDate && isWednesday(referenceDate),
          [WEEKDAYS.THURSDAY]: referenceDate && isThursday(referenceDate),
          [WEEKDAYS.FRIDAY]: referenceDate && isFriday(referenceDate),
          [WEEKDAYS.SATURDAY]: referenceDate && isSaturday(referenceDate),
          [WEEKDAYS.SUNDAY]: referenceDate && isSunday(referenceDate),
        },
      },
    },
    referenceDate && {
      key: 'monthly',
      config: {
        unit: MONTH,
        amount: 1,
      },
    },
  ].filter(Boolean);

const weekdayButtons = [
  { value: WEEKDAYS.MONDAY, label: 'M', ariaLabel: 'Monday' },
  { value: WEEKDAYS.TUESDAY, label: 'T', ariaLabel: 'Tuesday' },
  { value: WEEKDAYS.WEDNESDAY, label: 'W', ariaLabel: 'Wednesday' },
  { value: WEEKDAYS.THURSDAY, label: 'T', ariaLabel: 'Thursday' },
  { value: WEEKDAYS.FRIDAY, label: 'F', ariaLabel: 'Friday' },
  { value: WEEKDAYS.SATURDAY, label: 'S', ariaLabel: 'Saturday' },
  { value: WEEKDAYS.SUNDAY, label: 'S', ariaLabel: 'Sunday' },
];

const useStyles = makeStyles((theme) => ({
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

const RecurringConfigEditing = ({ timestamp }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const formHasRecurringConfig = useSelector(selectFormHasRecurringConfig);
  const currentUnit = useSelector(selectFormRecurringConfigUnit) || 1;
  const currentAmount = useSelector(selectFormRecurringConfigAmount) || DAY;
  const currentActiveWeekdays = useSelector(selectFormRecurringConfigActiveWeekdays) || {};
  const currentRecurringConfig = useSelector(selectFormRecurringConfig);

  const presetOptions = useMemo(() => getPresetOptions(timestamp), [timestamp]);

  const [selectValue, setSelectValue] = useState(() => {
    if (!formHasRecurringConfig) {
      return '';
    }
    const preset = presetOptions.find(
      (option) =>
        currentRecurringConfig.amount === option.config.amount &&
        currentRecurringConfig.unit === option.config.unit &&
        (option.config.unit !== WEEK ||
          isEqual(currentRecurringConfig.activeWeekdays || {}, option.config.activeWeekdays || {})),
    );
    return preset ? preset.key : 'custom';
  });

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    if (newValue === '') {
      dispatch(clearFormRecurringConfig());
      setSelectValue('');
    } else if (newValue === 'custom') {
      const preset = presetOptions.find(({ key }) => key === 'onceWeekly');
      dispatch(setFormRecurringConfigToPreset(preset.config));
      setSelectValue('custom');
    } else {
      const preset = presetOptions.find(({ key }) => key === newValue);
      dispatch(setFormRecurringConfigToPreset(preset.config));
      setSelectValue(preset.key);
    }
  };

  const handleChangeAmount = (event) => {
    if (Number.isNaN(parseInt(event.target.value, 10)) || event.target.value <= 0) {
      return;
    }
    dispatch(setFormRecurringConfigAmount(parseInt(event.target.value, 10)));
  };
  const handleChangeUnit = (event) => {
    dispatch(setFormRecurringConfigUnit(event.target.value));
  };
  const handleActiveWeekdayToggle = (weekday) => {
    const newActiveWeekdays = {
      ...currentActiveWeekdays,
      [weekday]: !currentActiveWeekdays[weekday],
    };
    dispatch(setFormRecurringConfigActiveWeekdays(newActiveWeekdays));
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="flex-start" overflow="hidden">
      <Select
        onChange={handleSelectChange}
        value={timestamp ? selectValue : ''}
        fullWidth
        displayEmpty
        disabled={!timestamp}
        labelId="recurring-config-select-label"
      >
        <MenuItem key="noRepeat" value="">
          Don&apos;t repeat
        </MenuItem>

        {presetOptions.map((preset) => (
          <MenuItem key={preset.key} value={preset.key}>
            {getUserFacingRecurringText(preset.config, timestamp)}
          </MenuItem>
        ))}
        <MenuItem value="custom" key="custom">
          {selectValue !== 'custom'
            ? 'Custom...'
            : `Custom: ${getUserFacingRecurringText(currentRecurringConfig, timestamp)}`}
        </MenuItem>
      </Select>

      {selectValue === 'custom' && (
        <Box display="flex" flexDirection="column" alignItems="stretch" mt={2} ml={4} mr={10}>
          <Box mb={2} display="flex" flexDirection="row">
            <Box display="flex" alignItems="center" flexGrow={1}>
              <Typography variant="body1">Repeat every</Typography>
            </Box>
            <Input
              type="number"
              min="1"
              max="1000"
              value={currentAmount}
              onChange={handleChangeAmount}
              className={classes.amountInput}
            />
            <Select value={currentUnit} onChange={handleChangeUnit}>
              <MenuItem value={DAY}>{currentAmount === 1 ? 'day' : 'days'}</MenuItem>
              <MenuItem value={WEEK}>{currentAmount === 1 ? 'week' : 'weeks'}</MenuItem>
              <MenuItem value={MONTH}>{currentAmount === 1 ? 'month' : 'months'}</MenuItem>
            </Select>
          </Box>

          {currentUnit === WEEK && (
            <Box display="flex" justifyContent="space-between">
              {weekdayButtons.map(({ value, label, ariaLabel }) => (
                <Button
                  key={value}
                  aria-label={ariaLabel}
                  size="large"
                  className={classes.weekdayButton}
                  variant={get(currentActiveWeekdays, [value]) ? 'contained' : 'text'}
                  color={get(currentActiveWeekdays, [value]) ? 'primary' : 'inherit'}
                  onClick={() => handleActiveWeekdayToggle(value)}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

RecurringConfigEditing.propTypes = {
  timestamp: PropTypes.number,
};

RecurringConfigEditing.defaultProps = {
  timestamp: null,
};

export default RecurringConfigEditing;
