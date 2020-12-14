import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isValid from 'date-fns/isValid';
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
import lighenDarkenColor from '../../../utils/lighenDarkenColor';

const useStyles = makeStyles((theme) => ({
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF',
  },
  eventName: {
    fontSize: theme.typography.body2.fontSize,
  },
  eventDate: {
    fontSize: `${parseFloat(theme.typography.body2.fontSize) * 0.8}rem`,
  },
}));

const getPaddingForDuration = (duration) => {
  if (duration <= 15) {
    return 2;
  }
  if (duration < 30) {
    return 2;
  }
  return 8;
};

const getLineHeightForDuration = (duration) => {
  if (duration <= 15) {
    return 1;
  }
  if (duration < 30) {
    return 1.25;
  }
  return 1.5;
};

const CalendarEvent = ({ id, zIndex }) => {
  const classes = useStyles();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const startDateTime = useSelector((state) => selectCalendarEventStartDateTime(state, id));
  const endDateTime = useSelector((state) => selectCalendarEventEndDateTime(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const startDate = parseISO(startDateTime);
  if (!isValid(startDate)) {
    return null;
  }
  const endDate = parseISO(endDateTime);
  if (!isValid(startDate)) {
    console.error('Invalid end date time', endDateTime, id); // eslint-disable-line no-console
  }

  const eventDurationInMinutes = differenceInMinutes(endDate, startDate);
  const eventDurationInTicks = Math.floor(eventDurationInMinutes / 15);
  const eventDisplayHeight = TICK_HEIGHT * eventDurationInTicks;

  const eventStartInMinutes = differenceInMinutes(startDate, startOfDay(startDate));
  const eventStartInTicks = Math.floor(eventStartInMinutes / 15);
  const eventDisplayTop = eventStartInTicks * TICK_HEIGHT;

  const backgroundColor = isPast(endDate) ? lighenDarkenColor(color, 40) : color;
  const verticalPadding = getPaddingForDuration(eventDurationInMinutes);

  return (
    <Box
      key={id}
      data-id={id}
      style={{
        height: eventDisplayHeight,
        top: eventDisplayTop,
        zIndex,
        backgroundColor,
        paddingTop: `${verticalPadding}px`,
        paddingBottom: `${verticalPadding}px`,
      }}
      className={classes.eventDefaultStyle}
      px={1}
    >
      <Typography
        component="p"
        className={classes.eventName}
        style={{ lineHeight: getLineHeightForDuration(eventDurationInMinutes) }}
      >
        {`${summary},`}
        <span className={classes.eventDate}>
          {' '}
          {isValid(startDate) ? format(startDate, 'h:mm a') : ''}
          {' - '}
          {isValid(endDate) ? format(endDate, 'h:mm a') : ''}
        </span>
      </Typography>
    </Box>
  );
};

CalendarEvent.propTypes = {
  id: PropTypes.string.isRequired,
  zIndex: PropTypes.number.isRequired,
};

export default CalendarEvent;
