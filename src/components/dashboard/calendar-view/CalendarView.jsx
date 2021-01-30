import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import isToday from 'date-fns/isToday';
import isValid from 'date-fns/isValid';
import getYear from 'date-fns/getYear';
import { makeStyles } from '@material-ui/core/styles';

import useLoadEvents from './useLoadEvents';
import CalendarNavBar from './CalendarNavBar';
import Ticks from './Ticks';
import CalendarDayEventsList from './CalendarDayEventsList';
import AllDayEventsSection from './AllDayEventsSection';
import CurrentTimeLine from './CurrentTimeLine';
import { TICK_HEIGHT, TICKS_PER_HOUR } from '../../../constants/tickConstants';
import CalendarDroppable from './CalendarDroppable';
import {
  selectCalendarDisplayTimestamp,
  setCalendarDisplayTimestamp,
} from '../../../modules/dashboard';

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

const CalendarView = () => {
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

  const { fetching } = useLoadEvents(timestamp);

  // If we've already scrolled, we prevent scrolling when events reload in the background
  const scrollAlreadyApplied = useRef(false);
  useEffect(() => {
    scrollAlreadyApplied.current = false;
  }, [timestamp]);

  // Management of current time bar and scrolling
  const today = isToday(timestamp);
  const currentTimeRef = useRef();
  const firstEventCardScrollAnchorRef = useRef();
  useEffect(() => {
    if (fetching || scrollAlreadyApplied.current) {
      return;
    }
    const validRef = today ? currentTimeRef : firstEventCardScrollAnchorRef;
    if (validRef && validRef.current) {
      validRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
      scrollAlreadyApplied.current = true;
    }
  }, [today, fetching]);

  return (
    <>
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
          selectableEvents
        />
        <Ticks tickHeight={TICK_HEIGHT} ticksPerHour={TICKS_PER_HOUR} />
        {today && <CurrentTimeLine ref={currentTimeRef} />}
      </CalendarDroppable>
    </>
  );
};

export default CalendarView;
