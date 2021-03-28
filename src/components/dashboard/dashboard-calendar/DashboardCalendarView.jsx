import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import isToday from 'date-fns/isToday';
import isValid from 'date-fns/isValid';
import getYear from 'date-fns/getYear';
import { makeStyles } from '@material-ui/core/styles';

import CalendarNavBar from '../calendar-view/CalendarNavBar';
import Ticks from '../calendar-view/Ticks';
import CalendarDayEventsList from '../calendar-view/CalendarDayEventsList';
import AllDayEventsSection from '../calendar-view/AllDayEventsSection';
import CurrentTimeLine from '../calendar-view/CurrentTimeLine';
import { TICK_HEIGHT, TICKS_PER_HOUR } from '../../../constants/tickConstants';
import CalendarDroppable from './CalendarDroppable';
import {
  selectCalendarDisplayTimestamp,
  setCalendarDisplayTimestamp,
} from '../../../modules/dashboard';
import CalendarEventsFetcher from '../CalendarEventsFetcher';
import { selectCalendarEventsTimeIsFetching } from '../../../modules/calendarEvents';

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    paddingTop: theme.spacing(5),
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
}));

const currentYear = getYear(new Date());

const DATE_URL_PARAM_FORMAT = 'yyyy-MM-dd';

const getInitialDate = (history) => {
  const formattedDateParam = new URLSearchParams(history.location.search).get('date');
  const dateParamTimestamp = formattedDateParam
    ? parse(formattedDateParam, DATE_URL_PARAM_FORMAT, new Date()).getTime()
    : null;
  const YEAR_THRESHOLD = 2;
  return isValid(dateParamTimestamp) &&
    getYear(dateParamTimestamp) < currentYear + YEAR_THRESHOLD &&
    getYear(dateParamTimestamp) > currentYear - YEAR_THRESHOLD
    ? dateParamTimestamp
    : undefined;
};

const DashboardCalendarView = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const history = useHistory();

  const timestamp = useSelector(selectCalendarDisplayTimestamp);

  // URL containing the date to use
  useEffect(() => {
    const initialDate = getInitialDate(history);
    if (initialDate) {
      dispatch(setCalendarDisplayTimestamp(initialDate));
    }
  }, [dispatch, history]);

  // Management of URL parameter for date
  useEffect(() => {
    if (!timestamp) {
      return;
    }
    const dateParam = new URLSearchParams(history.location.search).get('date');
    const formattedDate = format(timestamp, DATE_URL_PARAM_FORMAT);
    if (!dateParam || `${dateParam}` !== `${formattedDate}`) {
      const updatedSearch = new URLSearchParams(history.location.search);
      updatedSearch.set('date', formattedDate);
      history.replace({ pathname: history.location.pathname, search: updatedSearch.toString() });
    }
  }, [history, timestamp]);

  const fetching = useSelector((state) => selectCalendarEventsTimeIsFetching(state, timestamp));

  // If we've already scrolled, we prevent scrolling when events reload in the background
  const scrollAlreadyApplied = useRef(false);
  useEffect(() => {
    scrollAlreadyApplied.current = false;
  }, [timestamp]);

  // Management of current time bar and scrolling
  const currentTimeRef = useRef();
  const firstEventCardScrollAnchorRef = useRef();
  useEffect(() => {
    if (fetching || scrollAlreadyApplied.current) {
      return;
    }
    const validRef = isToday(timestamp) ? currentTimeRef : firstEventCardScrollAnchorRef;
    if (validRef && validRef.current) {
      validRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      scrollAlreadyApplied.current = true;
    }
  }, [timestamp, fetching]);

  return (
    <>
      <CalendarEventsFetcher date={timestamp} />

      <CalendarNavBar
        timestamp={timestamp}
        onChange={(newDate) => dispatch(setCalendarDisplayTimestamp(newDate))}
        fetching={fetching}
      />
      <AllDayEventsSection timestamp={timestamp} />
      <CalendarDroppable
        className={classes.container}
        tickHeight={TICK_HEIGHT}
        ticksPerHour={TICKS_PER_HOUR}
      >
        <CalendarDayEventsList
          firstEventCardScrollAnchorRef={firstEventCardScrollAnchorRef}
          timestamp={timestamp}
          tickHeight={TICK_HEIGHT}
          ticksPerHour={TICKS_PER_HOUR}
          interactive
        />
        <Ticks tickHeight={TICK_HEIGHT} ticksPerHour={TICKS_PER_HOUR} />
        {isToday(timestamp) && <CurrentTimeLine ref={currentTimeRef} />}
      </CalendarDroppable>
    </>
  );
};

export default DashboardCalendarView;
