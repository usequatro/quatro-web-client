import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isPast from 'date-fns/isPast';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import startOfDay from 'date-fns/startOfDay';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TICK_HEIGHT from './tickHeight';

import {
  selectCalendarEventSummary,
  selectCalendarEventStartDateTime,
  selectCalendarEventEndDateTime,
  selectCalendarEventCalendarId,
} from '../../../modules/calendarEvents';
import { selectCalendarColor } from '../../../modules/calendars';

const useStyles = makeStyles(() => ({
  pastEvent: {
    opacity: '0.4',
  },
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF',
  },
  eventName: {
    fontWeight: 'bold',
    display: 'block',
    fontSize: 14,
  },
  eventInfo: {
    display: 'block',
    fontSize: 12,
  },
}));

const CalendarEvent = ({ id, zIndex }) => {
  const classes = useStyles();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const startDateTime = useSelector((state) => selectCalendarEventStartDateTime(state, id));
  const endDateTime = useSelector((state) => selectCalendarEventEndDateTime(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const startDate = parseISO(startDateTime);
  const endDate = parseISO(endDateTime);

  // @TODO: account for recurring events, which start date is the date of the original event
  const eventIsPast = isPast(startDate);

  const eventDurationInMinutes = differenceInMinutes(endDate, startDate);
  const eventDurationInTicks = Math.floor(eventDurationInMinutes / 15);
  const eventDisplayHeight = TICK_HEIGHT * eventDurationInTicks;

  const eventStartInMinutes = differenceInMinutes(startDate, startOfDay(startDate));
  const eventStartInTicks = Math.floor(eventStartInMinutes / 15);
  const eventDisplayTop = eventStartInTicks * TICK_HEIGHT;

  return (
    <Box
      key={id}
      data-id={id}
      style={{ height: eventDisplayHeight, top: eventDisplayTop, zIndex, backgroundColor: color }}
      className={`${classes.eventDefaultStyle} ${eventIsPast && classes.pastEvent}`}
    >
      <Typography component="p" className={classes.eventName}>
        {summary}
      </Typography>
      <Typography component="p" className={classes.eventInfo}>
        {format(startDate, 'h:mm a')}
        {' - '}
        {format(endDate, 'h:mm a')}
      </Typography>
    </Box>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  zIndex: PropTypes.string.isRequired,
};

export default CalendarEvent;
