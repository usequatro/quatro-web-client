import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import EventCard from './EventCard';
import { selectSortedCalendarEventIds } from '../../../modules/calendarEvents';

const useStyles = makeStyles(() => ({
  listContainer: {
    position: 'relative',
    width: '80%',
    alignSelf: 'flex-end',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const CalendarDayEventsList = ({ firstEventCardScrollAnchorRef, date }) => {
  const classes = useStyles();
  const sortedCalendarEventIds = useSelector((state) => selectSortedCalendarEventIds(state, date));

  return (
    <Box className={classes.listContainer}>
      {sortedCalendarEventIds.map((calendarEventId, index) => (
        <EventCard
          key={calendarEventId}
          scrollAnchorRef={index === 0 ? firstEventCardScrollAnchorRef : undefined}
          id={calendarEventId}
        />
      ))}
    </Box>
  );
};

CalendarDayEventsList.propTypes = {
  firstEventCardScrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  date: PropTypes.instanceOf(Date).isRequired,
};
CalendarDayEventsList.defaultProps = {
  firstEventCardScrollAnchorRef: undefined,
};

export default CalendarDayEventsList;
