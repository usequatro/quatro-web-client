import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
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

const RecurringConfigEditing = ({ timestamp, recurringConfig, onChange }) => {
  const classes = useStyles();

  const hasRecurringConfig = recurringConfig != null;
  const unit = recurringConfig ? recurringConfig.unit : 1;
  const amount = recurringConfig ? recurringConfig.amount : DAY;
  const activeWeekdays = recurringConfig ? recurringConfig.activeWeekdays : {};

  const presetOptions = useMemo(() => getPresetOptions(timestamp), [timestamp]);

  const [selectValue, setSelectValue] = useState(() => {
    if (!hasRecurringConfig) {
      return '';
    }
    const preset = presetOptions.find(
      (option) =>
        amount === option.config.amount &&
        unit === option.config.unit &&
        (option.config.unit !== WEEK ||
          isEqual(activeWeekdays || {}, option.config.activeWeekdays || {})),
    );
    return preset ? preset.key : 'custom';
  });

  const handleSelectChange = (event) => {
    const newValue = event.target.value;
    if (newValue === '') {
      onChange(null);
      setSelectValue('');
    } else if (newValue === 'custom') {
      const preset = presetOptions.find(({ key }) => key === 'onceWeekly');
      onChange(preset.config);
      setSelectValue('custom');
    } else {
      const preset = presetOptions.find(({ key }) => key === newValue);
      onChange(preset.config);
      setSelectValue(preset.key);
    }
  };

  const handleChangeAmount = (event) => {
    if (Number.isNaN(parseInt(event.target.value, 10)) || event.target.value <= 0) {
      return;
    }
    onChange({ ...recurringConfig, amount: parseInt(event.target.value, 10) });
  };
  const handleChangeUnit = (event) => {
    onChange({ ...recurringConfig, unit: event.target.value });
  };
  const handleActiveWeekdayToggle = (weekday) => {
    const newActiveWeekdays = {
      ...activeWeekdays,
      [weekday]: !activeWeekdays[weekday],
    };
    onChange({ ...recurringConfig, activeWeekdays: newActiveWeekdays });
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
            : `Custom: ${getUserFacingRecurringText(recurringConfig, timestamp)}`}
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
              value={amount}
              onChange={handleChangeAmount}
              className={classes.amountInput}
            />
            <Select value={unit} onChange={handleChangeUnit}>
              <MenuItem value={DAY}>{amount === 1 ? 'day' : 'days'}</MenuItem>
              <MenuItem value={WEEK}>{amount === 1 ? 'week' : 'weeks'}</MenuItem>
              <MenuItem value={MONTH}>{amount === 1 ? 'month' : 'months'}</MenuItem>
            </Select>
          </Box>

          {unit === WEEK && (
            <Box display="flex" justifyContent="space-between">
              {weekdayButtons.map(({ value, label, ariaLabel }) => (
                <Button
                  key={value}
                  aria-label={ariaLabel}
                  size="large"
                  className={classes.weekdayButton}
                  variant={get(activeWeekdays, [value]) ? 'contained' : 'text'}
                  color={get(activeWeekdays, [value]) ? 'primary' : 'inherit'}
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
  onChange: PropTypes.func.isRequired,
  timestamp: PropTypes.number.isRequired,
  recurringConfig: PropTypes.shape({
    unit: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    activeWeekdays: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }),
};

RecurringConfigEditing.defaultProps = {
  recurringConfig: null,
};

export default RecurringConfigEditing;
