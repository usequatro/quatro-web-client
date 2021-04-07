import React, { useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import addMinutes from 'date-fns/addMinutes';
import startOfDay from 'date-fns/startOfDay';
import roundToNearestMinutes from 'date-fns/roundToNearestMinutes';

import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import Ticks from '../calendar-view/Ticks';
import CalendarDayEventsList from '../calendar-view/CalendarDayEventsList';
import LoaderScreen from '../../ui/LoaderScreen';
import CalendarEventsFetcher from '../CalendarEventsFetcher';
import { selectCalendarEventsTimeIsFetching } from '../../../modules/calendarEvents';

const useStyles = makeStyles((theme) => ({
  visualContainer: {
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
    maxHeight: theme.spacing(15),
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      maxHeight: theme.spacing(20),
    },
  },
  scrollContainer: {
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create('opacity'),
    maxHeight: theme.spacing(15),
    [theme.breakpoints.up('sm')]: {
      maxHeight: theme.spacing(25),
    },
    [theme.breakpoints.up('md')]: {
      maxHeight: theme.spacing(35),
    },
  },
  loader: {
    zIndex: 3,
    position: 'absolute',
    top: 0,
  },
}));

const TICK_HEIGHT = 30;
const TICKS_PER_HOUR = 1;

const CalendarSchedulingThumbnail = ({
  startDateTimestamp,
  duration,
  onChangeStartDateTimestamp,
}) => {
  const classes = useStyles();

  const ticksContainerRef = useRef();
  const fetching = useSelector((state) =>
    selectCalendarEventsTimeIsFetching(state, startDateTimestamp),
  );

  const handleClick = (event) => {
    const scrollContainerRect = ticksContainerRef.current.getBoundingClientRect();
    const verticalOffsetPx = event.pageY - scrollContainerRect.top;
    const verticalOffsetMinutes = Math.floor(
      (verticalOffsetPx / TICK_HEIGHT) * (60 / TICKS_PER_HOUR),
    );
    const newStartDate = addMinutes(startOfDay(startDateTimestamp), verticalOffsetMinutes);
    const newRoundedStartDate = roundToNearestMinutes(newStartDate, { nearestTo: 30 });
    onChangeStartDateTimestamp(newRoundedStartDate.getTime());
  };

  const scrollContainerRef = useRef();
  const handlePlaceholderChangedPosition = useCallback(({ y, height: placeholderHeight }) => {
    if (!scrollContainerRef.current) {
      return;
    }
    const { height: containerHeight } = scrollContainerRef.current.getBoundingClientRect();
    scrollContainerRef.current.scrollTop = y - containerHeight / 2 + placeholderHeight / 2;
  }, []);

  return (
    <Paper className={classes.visualContainer} elevation={0} variant="outlined">
      <CalendarEventsFetcher date={startDateTimestamp} />
      {fetching && <LoaderScreen className={classes.loader} background="transparent" />}
      <div
        className={classes.scrollContainer}
        style={{
          opacity: fetching ? 0.25 : 1,
          // avoiding smooth scrolling on the first render
          scrollBehavior: scrollContainerRef.current ? 'smooth' : 'auto',
        }}
        onClick={handleClick}
        role="presentation"
        ref={scrollContainerRef}
      >
        <CalendarDayEventsList
          timestamp={startDateTimestamp}
          tickHeight={TICK_HEIGHT}
          ticksPerHour={TICKS_PER_HOUR}
          width="80%"
          placeholder={{
            start: startDateTimestamp,
            end: addMinutes(startDateTimestamp, duration).getTime(),
            onChange: handlePlaceholderChangedPosition,
          }}
          interactive={false}
        />
        <Ticks
          tickHeight={TICK_HEIGHT}
          ticksPerHour={TICKS_PER_HOUR}
          fontSize="0.625rem"
          format="h a"
          ref={ticksContainerRef}
          date={startDateTimestamp}
        />
      </div>
    </Paper>
  );
};

CalendarSchedulingThumbnail.propTypes = {
  startDateTimestamp: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  onChangeStartDateTimestamp: PropTypes.func.isRequired,
};

export default CalendarSchedulingThumbnail;
