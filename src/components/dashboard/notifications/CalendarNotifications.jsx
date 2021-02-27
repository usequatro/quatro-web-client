import React, { memo, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { selectCalendarEventIdsForNotifications } from '../../../modules/calendarEvents';
import { selectSystemNoficationsMinutesInAdvance } from '../../../modules/calendars';
import EventNotification from './EventNotification';

const getCurrentMinutes = () => differenceInMinutes(new Date(), startOfDay(new Date()));

const CalendarNotifications = ({ calendarId }) => {
  // every few seconds, we update minutes. If there are changes, component re-renders
  const [, setMinutes] = useState(getCurrentMinutes());
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutes(getCurrentMinutes());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
