import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadCalendarEvents,
  selectCalendarEventsTimeNeedsFetching,
} from '../../modules/calendarEvents';
import { selectCalendarIds } from '../../modules/calendars';
import { selectGapiHasEventsManageScope, selectGapiUserSignedIn } from '../../modules/session';
import { useNotification } from '../Notification';

/**
 * Component to handle fetching events for the given calendar in the given range
 */
const SingleCalendarEventsFetcher = ({ calendarId, date }) => {
  const dispatch = useDispatch();
  const { notifyError } = useNotification();

  const fetchNeeded = useSelector((state) =>
    selectCalendarEventsTimeNeedsFetching(state, calendarId, date),
  );

  useEffect(() => {
    if (fetchNeeded) {
      dispatch(
        loadCalendarEvents(calendarId, date, {
          errorCallback: () => {
            notifyError('Error loading events from Google Calendar');
          },
        }),
      );
    }
  }, [dispatch, notifyError, calendarId, date, fetchNeeded]);

  return null;
};

SingleCalendarEventsFetcher.propTypes = {
  calendarId: PropTypes.string.isRequired,
  date: PropTypes.number.isRequired,
};

/**
 * Component to handle fetching events for all connected calendars in the given range
 */
const CalendarEventsFetcher = ({ date }) => {
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiHasEventManageScope = useSelector(selectGapiHasEventsManageScope);
  const calendarIds = useSelector(selectCalendarIds);

  if (!gapiUserSignedIn || !gapiHasEventManageScope) {
    return null;
  }

  return calendarIds.map((calendarId) => (
    <SingleCalendarEventsFetcher key={calendarId} calendarId={calendarId} date={date} />
  ));
};

CalendarEventsFetcher.propTypes = {
  date: PropTypes.number.isRequired,
};

export default CalendarEventsFetcher;
