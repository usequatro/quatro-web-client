import { EFFORT_TO_DURATION } from '../constants/effort';

/**
 * @param {number} duration
 * @returns {number} - index in EFFORT_TO_DURATION
 */
export default function getApproximatedEffortToCalendarBlockDuration(duration) {
  const distances = EFFORT_TO_DURATION.map((effortMinutes) => Math.abs(duration - effortMinutes));
  const minDistance = Math.min(...distances);
  const effortLevel = distances.indexOf(minDistance);
  return effortLevel;
}
