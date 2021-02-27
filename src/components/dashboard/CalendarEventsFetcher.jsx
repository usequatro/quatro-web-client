import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadCalendarEvents,
  selectCalendarEventsIntervalIsFetched,
} from '../../modules/calendarEvents';
import { selectCalendarIds } from '../../modules/calendars';
import { selectGapiHasEventsManageScope, selectGapiUserSignedIn } from '../../modules/session';
import { useNotification } from '../Notification';

/**
 * Component to handle fetching events for the given calendar in the given range
 */
const SingleCalendarEventsFetcher = ({ calendarId, start, end }) => {
  const dispatch = useDispatch();
  const { notifyError } = useNotification();

  const fetchNeeded = useSelector(
    (state) => !selectCalendarEventsIntervalIsFetched(state, calendarId, start, end),
  );

  useEffect(() => {
    if (fetchNeeded) {
      dispatch(
        loadCalendarEvents(calendarId, start, end, {
          errorCallback: () => {
            notifyError('Error loading events from Google Calendar');
          },
        }),
      );
    }
  }, [dispatch, notifyError, calendarId, start, end, fetchNeeded]);

  return null;
};

SingleCalendarEventsFetcher.propTypes = {
  calendarId: PropTypes.string.isRequired,
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};

/**
 * Component to handle fetching events for all connected calendars in the given range
 */
const CalendarEventsFetcher = ({ start, end }) => {
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiHasEventManageScope = useSelector(selectGapiHasEventsManageScope);
  const calendarIds = useSelector(selectCalendarIds);

  if (!gapiUserSignedIn || !gapiHasEventManageScope) {
    return null;
  }

  return calendarIds.map((calendarId) => (
    <SingleCalendarEventsFetcher key={calendarId} calendarId={calendarId} start={start} end={end} />
  ));
};

CalendarEventsFetcher.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};

export default CalendarEventsFetcher;
