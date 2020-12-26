import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import isToday from 'date-fns/isToday';
import isValid from 'date-fns/isValid';
import getYear from 'date-fns/getYear';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import { selectCalendarIds } from '../../../modules/calendars';
import { loadEvents, selectCalendarEventsNeedLoading } from '../../../modules/calendarEvents';

import CalendarNavBar from './CalendarNavBar';
import Ticks from './Ticks';
import CalendarDayEventsList from './CalendarDayEventsList';
import AllDayEventsSection from './AllDayEventsSection';
import CurrentTimeLine from './CurrentTimeLine';
import { selectGapiUserSignedIn } from '../../../modules/session';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
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
  const dateParamDate = formattedDateParam
    ? parse(formattedDateParam, DATE_URL_PARAM_FORMAT, new Date())
    : null;
  if (
    !isValid(dateParamDate) ||
    // Only let select some years in the past and the future
    getYear(dateParamDate) > currentYear + 2 ||
    getYear(dateParamDate) < currentYear - 2
  ) {
    return new Date();
  }
  return dateParamDate;
};

const CalendarView = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [fetching, setFetching] = useState(false);
  const [date, setDate] = useState(getInitialDate(history));

  // Management of URL parameter for date
  useEffect(() => {
    if (!date) {
      return;
    }
    const dateParam = new URLSearchParams(history.location.search).get('date');
    const formattedDate = format(date, DATE_URL_PARAM_FORMAT);
    if (!dateParam || `${dateParam}` !== `${formattedDate}`) {
      const updatedSearch = new URLSearchParams(history.location.search);
      updatedSearch.set('date', formattedDate);
      history.replace({ pathname: history.location.pathname, search: updatedSearch.toString() });
    }
  }, [history, date]);

  // Interval to trigger state updates so we can select again eventsNeedLoading
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calendar event fecthing
  const googleSignedIn = useSelector(selectGapiUserSignedIn);
  const calendarIds = useSelector(selectCalendarIds);
  const eventsNeedLoading = useSelector((state) =>
    selectCalendarEventsNeedLoading(state, format(date, 'yyyy-MM-dd'), currentTime),
  );
  useEffect(() => {
    if (!googleSignedIn || !eventsNeedLoading) {
      return undefined;
    }
    setFetching(true);
    const unsubscribe = dispatch(loadEvents(calendarIds, date, () => setFetching(false)));
    return unsubscribe;
  }, [dispatch, eventsNeedLoading, googleSignedIn, calendarIds, date]);

  // Management of current time bar and scrolling
  const today = isToday(date);
  const currentTimeRef = useRef();
  const firstEventCardScrollAnchorRef = useRef();
  useEffect(() => {
    if (fetching) {
      return;
    }
    const validRef = today ? currentTimeRef : firstEventCardScrollAnchorRef;
    if (validRef && validRef.current) {
      validRef.current.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [today, fetching]);

  return (
    <>
      <CalendarNavBar date={date} onChange={(newDate) => setDate(newDate)} fetching={fetching} />
      <AllDayEventsSection date={date} />
      <Box className={classes.container}>
        <CalendarDayEventsList
          firstEventCardScrollAnchorRef={firstEventCardScrollAnchorRef}
          date={date}
        />
        <Ticks />
        {today && <CurrentTimeLine ref={currentTimeRef} />}
      </Box>
    </>
  );
};

export default CalendarView;
