const normalizeBase = (value, from, to) => (value * to) / from;
const convertMillisecondsToDays = (time) => time / (1000 * 60 * 60 * 24);
const getDaysDue = (due) => convertMillisecondsToDays(Math.max(due - Date.now(), 0));

export default function calculateTaskScore(impact, effort, due) {
  if (!Number.isInteger(impact) || !Number.isInteger(effort)) {
    return 0;
  }
  const normalizedImpact = normalizeBase(impact + 1, 6, 10);
  const normalizedEffort = normalizeBase(effort + 1, 6, 10);

  const weightenedImpact = normalizedImpact ** 1.5;
  const weightenedEffort = normalizedEffort ** 1;

  // https://www.wolframalpha.com/input/?i=plot+2%2Fx
  const daysUntilFactor = due ? 1 + 2 / Math.min(getDaysDue(due), 10000) : 1;

  return (weightenedImpact / weightenedEffort) * daysUntilFactor;
};
