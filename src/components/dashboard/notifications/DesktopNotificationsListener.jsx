import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import once from 'lodash/once';

import { selectCalendarIdsWithSystemNotificationsEnabled } from '../../../modules/calendars';

import CalendarNotifications from './CalendarNotifications';

const hasNotificationSupport = () => {
  try {
    return 'Notification' in window;
  } catch (error) {
    return false;
  }
};

const requestPermissionForNotificationsOnce = once((callback) => {
  Notification.requestPermission(callback);
});
const DesktopNotificationsListener = () => {
  const enabledCalendarIds = useSelector(selectCalendarIdsWithSystemNotificationsEnabled);

  if (!hasNotificationSupport()) {
    return null;
  }

  if (enabledCalendarIds.length === 0) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    requestPermissionForNotificationsOnce(() => {
      // eslint-disable-next-line no-new
      new Notification('Demo notification', {
        body: 'It works. Thanks!',
        icon: '/images/logo_arrows_full_square.png',
      });
    });
    return null;
  }

  return enabledCalendarIds.map((calendarId) => (
    <CalendarNotifications key={calendarId} calendarId={calendarId} />
  ));
};

export default memo(DesktopNotificationsListener);
