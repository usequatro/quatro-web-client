import format from 'date-fns/format';
import isYesterday from 'date-fns/isYesterday';
import isToday from 'date-fns/isToday';
import isTomorrow from 'date-fns/isTomorrow';
import isSameYear from 'date-fns/isSameYear';

export default function formatDateTime(date) {
  if (isYesterday(date)) {
    return `Yesterday - ${format(date, 'h:mm a')}`;
  }
  if (isToday(date)) {
    return `Today - ${format(date, 'h:mm a')}`;
  }
  if (isTomorrow(date)) {
    return `Tomorrow - ${format(date, 'h:mm a')}`;
  }
  return isSameYear(date, Date.now())
    ? format(date, 'EEE d LLL - h:mm a')
    : format(date, 'EEE d LLL y - h:mm a');
}
