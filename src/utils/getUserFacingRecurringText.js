import cond from 'lodash/cond';
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

const areAllActive = (activeWeekdays) =>
  activeWeekdays[MONDAY] &&
  activeWeekdays[TUESDAY] &&
  activeWeekdays[WEDNESDAY] &&
  activeWeekdays[THURSDAY] &&
  activeWeekdays[FRIDAY] &&
  activeWeekdays[SATURDAY] &&
  activeWeekdays[SUNDAY];

const areAllWeekdaysActive = (activeWeekdays) =>
  activeWeekdays[MONDAY] &&
  activeWeekdays[TUESDAY] &&
  activeWeekdays[WEDNESDAY] &&
  activeWeekdays[THURSDAY] &&
  activeWeekdays[FRIDAY] &&
  !activeWeekdays[SATURDAY] &&
  !activeWeekdays[SUNDAY];

/**
 * For a recurring config object, returns a user-facing text to show for it
 * @example 'Every Monday at 9am'
 * @param {Object} recurringConfig
 * @return {string}
 */
export default function getUserFacingRecurringText(recurringConfig) {
  if (!recurringConfig) {
    return '';
  }

  const { amount, unit, activeWeekdays } = recurringConfig;

  const amountAndUnit = cond([
    [() => unit === DAY, () => (amount === 1 ? 'day' : `${amount} days`)],
    [
      () => unit === WEEK,
      () => {
        const activeWeekdaysText = cond([
          [() => areAllActive(activeWeekdays), () => 'day'],
          [() => areAllWeekdaysActive(activeWeekdays), () => 'weekday (Monday to Friday)'],
          [
            () => true,
            () => {
              const labels = [
                activeWeekdays[MONDAY] && 'Monday',
                activeWeekdays[TUESDAY] && 'Tuesday',
                activeWeekdays[WEDNESDAY] && 'Wednesday',
                activeWeekdays[THURSDAY] && 'Thursday',
                activeWeekdays[FRIDAY] && 'Friday',
                activeWeekdays[SATURDAY] && 'Saturday',
                activeWeekdays[SUNDAY] && 'Sunday',
              ].filter(Boolean);

              return labels.reduce((memo, day, index) => {
                const separator =
                  // eslint-disable-next-line no-nested-ternary
                  index > 0 && index < labels.length - 1
                    ? ', '
                    : index === labels.length - 1
                    ? ' and '
                    : '';
                return `${memo}${separator}${day}`;
              });
            },
          ],
        ])();

        return `${activeWeekdaysText}${amount === 1 ? '' : ` every ${amount} weeks`}`;
      },
    ],
    [() => unit === MONTH, () => (amount === 1 ? 'month' : `${amount} months`)],
  ])(unit);

  return `Every ${amountAndUnit}`;
}
