import isEqual from 'lodash/isEqual';

import * as WEEKDAYS from '../constants/weekdays';
import * as DURATION_UNITS from '../constants/recurringDurationUnits';

import { RecurringConfig, RecurringConfigWithoutId } from '../types';

export const RECURRING_CONFIG_EVERY_MONDAY:RecurringConfigWithoutId = {
  unit: DURATION_UNITS.WEEK,
  amount: 1,
  activeWeekdays: {
    [WEEKDAYS.MONDAY]: true,
    [WEEKDAYS.TUESDAY]: false,
    [WEEKDAYS.WEDNESDAY]: false,
    [WEEKDAYS.THURSDAY]: false,
    [WEEKDAYS.FRIDAY]: false,
    [WEEKDAYS.SATURDAY]: false,
    [WEEKDAYS.SUNDAY]: false,
  },
};
export const RECURRING_CONFIG_EVERY_WEEKDAY:RecurringConfigWithoutId = {
  unit: DURATION_UNITS.WEEK,
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
};

export const NO_RECURRENCE_OPTION = '';
export const EVERY_MONDAY_OPTION = 'everyMonday';
export const WEEKDAYS_OPTION = 'weekdays';
export const CUSTOM_OPTION = 'custom';

export const RECURRENCE_PRESET_LABELS = {
  [NO_RECURRENCE_OPTION]: '',
  [EVERY_MONDAY_OPTION]: 'Every Monday',
  [WEEKDAYS_OPTION]: 'Every weekday (Monday to Friday)',
  [CUSTOM_OPTION]: 'Custom',
};

export const getRecurringPresetFromConfig = (recurringConfig:RecurringConfig) => {
  if (!recurringConfig || isEqual(recurringConfig, {})) {
    return NO_RECURRENCE_OPTION;
  }
  if (recurringConfig.unit === RECURRING_CONFIG_EVERY_MONDAY.unit &&
    recurringConfig.amount === RECURRING_CONFIG_EVERY_MONDAY.amount &&
    isEqual(recurringConfig.activeWeekdays, RECURRING_CONFIG_EVERY_MONDAY.activeWeekdays)
  ) {
    return EVERY_MONDAY_OPTION;
  }
  if (recurringConfig.unit === RECURRING_CONFIG_EVERY_WEEKDAY.unit &&
    recurringConfig.amount === RECURRING_CONFIG_EVERY_WEEKDAY.amount &&
    isEqual(recurringConfig.activeWeekdays, RECURRING_CONFIG_EVERY_WEEKDAY.activeWeekdays)
  ) {
    return WEEKDAYS_OPTION;
  }
  return CUSTOM_OPTION;
};

export const getRecurringOptionLabel = (recurringConfig:RecurringConfig) => {
  const preset = getRecurringPresetFromConfig(recurringConfig);
  return RECURRENCE_PRESET_LABELS[preset];
};
