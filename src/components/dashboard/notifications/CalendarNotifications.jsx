import React, { memo } from 'react';

import { useSelector } from 'react-redux';

import { selectCalendarEventIdsForNotifications } from '../../../modules/calendarEvents';
import { selectSystemNoficationsMinutesInAdvance } from '../../../modules/calendars';
import EventNotification from './EventNotification';

const CalendarNotifications = ({ calendarId }) => {
  const minutesInAdvance = useSelector((state) =>
    selectSystemNoficationsMinutesInAdvance(state, calendarId),
  );
  const calendarEventIds = useSelector((state) =>
    selectCalendarEventIdsForNotifications(state, calendarId, {
      earliest: Date.now(),
      latest: Date.now() + minutesInAdvance * 60000,
    }),
  );

  return calendarEventIds.map((calendarEventId) => (
    <EventNotification key={calendarEventId} calendarEventId={calendarEventId} />
  ));
};

export default memo(CalendarNotifications);
