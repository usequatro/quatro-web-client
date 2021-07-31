import { memo, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import differenceInSeconds from 'date-fns/differenceInSeconds';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartTimestamp,
} from '../../../modules/calendarEvents';
import { isDesktopClient, removeDockBadge } from '../../../utils/applicationClient';
import debugConsole from '../../../utils/debugConsole';

const CalendarNotification = ({ calendarEventId }) => {
  const notificationRef = useRef();
  const summary = useSelector((state) => selectCalendarEventSummary(state, calendarEventId));
  const startTimestamp = useSelector((state) =>
    selectCalendarEventStartTimestamp(state, calendarEventId),
  );

  const closeNotification = useCallback(() => {
    if (notificationRef.current) {
      notificationRef.current.close();
      debugConsole.log('notification', 'Notification closed');
    }
  }, []);

  if (!notificationRef.current) {
    const minutesLeft = Math.round(differenceInSeconds(startTimestamp, new Date()) / 60);
    notificationRef.current = new Notification(summary, {
      body: `At ${format(startTimestamp, 'h:mm a')}, in ${minutesLeft} min`,
      icon: '/images/logo_arrows_full_square.png',
      requireInteraction: true,
    });
    debugConsole.log('notification', 'Notification created');

    // When a notification shows, if the uses closes it, the badge stays on the icon by default
    // We don't want that, so clearing it when the notification closes here.
    notificationRef.current.addEventListener('close', () => {
      debugConsole.log('notification', 'Notification was closed');
      if (isDesktopClient()) {
        removeDockBadge();
        debugConsole.log('notification', 'Dock badge removed');
      }
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
