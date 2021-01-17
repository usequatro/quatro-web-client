import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import addMinutes from 'date-fns/addMinutes';
import startOfDay from 'date-fns/startOfDay';
import roundToNearestMinutes from 'date-fns/roundToNearestMinutes';

import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import useLoadEvents from '../calendar-view/useLoadEvents';
import Ticks from '../calendar-view/Ticks';
import CalendarDayEventsList from '../calendar-view/CalendarDayEventsList';
import LoaderScreen from '../../ui/LoaderScreen';

const useStyles = makeStyles((theme) => ({
  visualContainer: {
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative',
    maxHeight: theme.spacing(20),
  },
  scrollContainer: {
    overflow: 'auto',
    display: 'flex',
    maxHeight: theme.spacing(20),
    flexDirection: 'column',
    transition: theme.transitions.create('opacity'),
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
  const { fetching } = useLoadEvents(startDateTimestamp, { autoRefresh: false });

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

  return (
    <Paper className={classes.visualContainer} elevation={0} variant="outlined">
      {fetching && <LoaderScreen className={classes.loader} background="transparent" />}
      <div
        className={classes.scrollContainer}
        style={{ opacity: fetching ? 0.25 : 1 }}
        onClick={handleClick}
        role="presentation"
      >
        <CalendarDayEventsList
          timestamp={startDateTimestamp}
          tickHeight={TICK_HEIGHT}
          ticksPerHour={TICKS_PER_HOUR}
          width="80%"
          placeholder={{
            start: startDateTimestamp,
            end: addMinutes(startDateTimestamp, duration).getTime(),
          }}
          selectableEvents={false}
        />
        <Ticks
          tickHeight={TICK_HEIGHT}
          ticksPerHour={TICKS_PER_HOUR}
          fontSize="0.625rem"
          format="h a"
          ref={ticksContainerRef}
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