import getUserFacingRecurringText from './getUserFacingRecurringText';

import { DAY, WEEK, MONTH } from '../constants/recurringDurationUnits';
import {
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
} from '../constants/weekdays';

describe('getUserFacingRecurringText', () => {
  it('returns empty string when passed object is null', () => {
    expect(getUserFacingRecurringText(undefined)).toBe('');
    expect(getUserFacingRecurringText(null)).toBe('');
  });

  it('returns days', () => {
    expect(getUserFacingRecurringText({
      amount: 3,
      unit: DAY,
    })).toBe('Every 3 days');
    expect(getUserFacingRecurringText({
      amount: 1,
      unit: DAY,
    })).toBe('Every day');
  });

  it('returns months', () => {
    expect(getUserFacingRecurringText({
      amount: 3,
      unit: MONTH,
    })).toBe('Every 3 months');
    expect(getUserFacingRecurringText({
      amount: 1,
      unit: MONTH,
    })).toBe('Every month');
  });

  it('returns days of the week', () => {
    expect(getUserFacingRecurringText({
      amount: 1,
      unit: WEEK,
      activeWeekdays: {
        [MONDAY]: true,
        [TUESDAY]: true,
        [WEDNESDAY]: true,
      }
    })).toBe('Every Monday, Tuesday and Wednesday');
    expect(getUserFacingRecurringText({
      amount: 2,
      unit: WEEK,
      activeWeekdays: {
        [MONDAY]: true,
        [TUESDAY]: true,
        [WEDNESDAY]: true,
      }
    })).toBe('Every Monday, Tuesday and Wednesday every 2 weeks');
    expect(getUserFacingRecurringText({
      amount: 2,
      unit: WEEK,
      activeWeekdays: {
        [MONDAY]: true,
        [TUESDAY]: true,
        [WEDNESDAY]: true,
        [THURSDAY]: true,
        [FRIDAY]: true,
      }
    })).toBe('Every weekday every 2 weeks');
    expect(getUserFacingRecurringText({
      amount: 1,
      unit: WEEK,
      activeWeekdays: {
        [MONDAY]: true,
        [TUESDAY]: true,
        [WEDNESDAY]: true,
        [THURSDAY]: true,
        [FRIDAY]: true,
        [SATURDAY]: true,
        [SUNDAY]: true,
      }
    })).toBe('Every day');
  });
});
