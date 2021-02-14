import { memo, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartTimestamp,
} from '../../../modules/calendarEvents';

const CalendarNotification = ({ calendarEventId }) => {
  const notificationRef = useRef();
  const summary = useSelector((state) => selectCalendarEventSummary(state, calendarEventId));
  const startTimestamp = useSelector((state) =>
    selectCalendarEventStartTimestamp(state, calendarEventId),
  );

  const closeNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
    }
  }, []);

  if (!notificationRef.current) {
    const minutesLeft = Math.round(differenceInSeconds(startTimestamp, new Date()) / 60);
    notificationRef.current = new Notification(summary, {
      body: `At ${format(startTimestamp, 'h:mm a')}, in ${minutesLeft} min`,
      icon: '/images/logo_arrows_full_square.png',
      requireInteraction: true,
    });
  }

  useEffect(() => {
    window.addEventListener('beforeunload', closeNotification);

    return () => {
      window.removeEventListener('beforeunload', closeNotification);
      closeNotification();
    };
  }, [closeNotification]);

  return null;
};

CalendarNotification.propTypes = {
  calendarEventId: PropTypes.string.isRequired,
};

export default memo(CalendarNotification);
