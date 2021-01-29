import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  const dateParamDate = formattedDateParam
    ? parse(formattedDateParam, DATE_URL_PARAM_FORMAT, new Date()).getTime()
    : null;
  if (
    !isValid(dateParamDate) ||
    // Only let select some years in the past and the future
    getYear(dateParamDate) > currentYear + 2 ||
    getYear(dateParamDate) < currentYear - 2
  ) {
    return Date.now();
  }
  return dateParamDate;
};

const CalendarView = () => {
  const classes = useStyles();
  const history = useHistory();

  const initialDate = useMemo(() => getInitialDate(history), [history]);
  const [timestamp, setTimestamp] = useState(initialDate);

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
        onChange={(newDate) => setTimestamp(newDate instanceof Date ? newDate.getTime() : newDate)}
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
