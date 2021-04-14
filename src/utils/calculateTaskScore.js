import isPast from 'date-fns/isPast';
import round from 'lodash/round';

const normalizeBase = (value, from, to) => (value * to) / from;
const convertMillisecondsToDays = (time) => time / (1000 * 60 * 60 * 24);
const getDaysDue = (due) => convertMillisecondsToDays(Math.max(due - Date.now(), 0));

export default function calculateTaskScore(task) {
  const { impact, effort, due, calendarBlockStart } = task;

  if (!Number.isInteger(impact) || !Number.isInteger(effort)) {
    return 0;
  }
  const normalizedImpact = normalizeBase(impact + 1, 6, 10);
  const normalizedEffort = normalizeBase(effort + 1, 6, 10);

  const weightedImpact = normalizedImpact ** 1.5;
  const weightedEffort = normalizedEffort ** 1;

  // https://www.wolframalpha.com/input/?i=plot+2%2Fx
  const daysUntilFactor = due ? 1 + 2 / Math.min(getDaysDue(due), 10000) : 1;

  // When there was a calendar block and it's past, we multiply for a high number so it's at the top
  const calendarBlockStartFactor = calendarBlockStart && isPast(calendarBlockStart) ? 1000 : 1;

  const fullScore = (weightedImpact / weightedEffort) * daysUntilFactor * calendarBlockStartFactor;

  return round(fullScore, 3);
}
