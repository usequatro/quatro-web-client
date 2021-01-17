import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectCalendarIds } from '../../../modules/calendars';
import { loadEvents, selectCalendarEventsNeedLoading } from '../../../modules/calendarEvents';
import { selectGapiUserSignedIn } from '../../../modules/session';

const useTick = (enabled, timeout) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, timeout);
    return () => clearInterval(interval);
  }, [enabled, timeout]);
  return currentTime;
};

/**
 * Hook to group the logic for fetching calendar events and re-fetching them when necessary
 *
 * @param {number} timestamp
 * @param {Object} [options]
 * @param {bool} [options.autoRefresh] - default true
 * @return {Object}
 */
export default function useLoadEvents(timestamp, { autoRefresh = true } = {}) {
  const dispatch = useDispatch();
  const [fetching, setFetching] = useState(false);

  // Interval to trigger state updates so we can select again eventsNeedLoading
  const currentTime = useTick(autoRefresh, 5000);

  // Calendar event fecthing
  const googleSignedIn = useSelector(selectGapiUserSignedIn);
  const calendarIds = useSelector(selectCalendarIds);
  const eventsNeedLoading = useSelector((state) =>
    selectCalendarEventsNeedLoading(state, timestamp, currentTime),
  );
  useEffect(() => {
    if (!googleSignedIn || !eventsNeedLoading) {
      return undefined;
    }
    setFetching(true);

    let unsubscribed = false;
    let finished = false;

    dispatch(
      loadEvents(calendarIds, timestamp, () => {
        if (unsubscribed) {
          return;
        }
        finished = true;
        setFetching(false);
      }),
    );
    return () => {
      if (!finished) {
        setFetching(false);
        unsubscribed = true;
      }
    };
  }, [dispatch, eventsNeedLoading, googleSignedIn, calendarIds, timestamp]);

  return { fetching };
}
