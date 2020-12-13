import React from 'react';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import CalendarEvent from './CalendarEvent';
import { selectCalendarEventIds } from '../../../modules/calendarEvents';

const useStyles = makeStyles(() => ({
  calendarEventListContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const CalendarEventList = () => {
  const classes = useStyles();
  const calendarEventIds = useSelector(selectCalendarEventIds);

  return (
    <Box className={classes.calendarEventListContainer}>
      {calendarEventIds.map((calendarEventId, index) => (
        <CalendarEvent id={calendarEventId} zIndex={calendarEventIds.length - index} />
      ))}
    </Box>
  );
};

export default CalendarEventList;
