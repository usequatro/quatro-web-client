import cond from 'lodash/cond';
import format from 'date-fns/format';
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

function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * For a recurring config object, returns a user-facing text to show for it
 * @example 'Every Monday at 9am'
 * @param {Object} recurringConfig
 * @param {number} [referenceDate]
 * @param {Object} [options]
 * @param {boolean} [options.capitalize]
 * @return {string}
 */
export default function getUserFacingRecurringText(
  recurringConfig,
  referenceDate,
  { capitalize = true } = {},
) {
  if (!recurringConfig) {
    return '';
  }

  const { amount, unit, activeWeekdays } = recurringConfig;

  const text = cond([
    [() => unit === DAY, () => `every ${amount === 1 ? 'day' : `${amount} days`}`],
    [
      () => unit === WEEK,
      () => {
        const activeWeekdaysText = cond([
          [() => areAllActive(activeWeekdays), () => 'every day'],
          [() => areAllWeekdaysActive(activeWeekdays), () => 'every weekday (Monday to Friday)'],
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

              const labelsText = labels.reduce((memo, day, index) => {
                const separator =
                  // eslint-disable-next-line no-nested-ternary
                  index > 0 && index < labels.length - 1
                    ? ', '
                    : index > 0 && index === labels.length - 1
                    ? ' and '
                    : '';
                return `${memo}${separator}${day}`;
              }, '');

              return amount === 1 ? `every ${labelsText}` : labelsText;
            },
          ],
        ])();

        return `${activeWeekdaysText}${amount === 1 ? '' : ` every ${amount} weeks`}`;
      },
    ],
    [
      () => unit === MONTH,
      () => {
        const monthsCopy = amount === 1 ? 'monthly' : `every ${amount} months`;
        const onTheCopy = referenceDate ? `on the ${format(referenceDate, 'do')}` : '';

        return [monthsCopy, onTheCopy].join(' ').trim();
      },
    ],
    [
      () => true,
      () => {
        // eslint-disable-next-line no-console
        console.warn('Invalid unit', recurringConfig);
        return '';
      },
    ],
  ])(unit);

  return capitalize ? capitalizeFirstLetter(text) : text;
}
