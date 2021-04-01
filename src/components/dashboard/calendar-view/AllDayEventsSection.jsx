import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import CalendarEvent from '../event-card/CalendarEvent';
import TickLabel from './TickLabel';
import { selectAllDayCalendarEventIds } from '../../../modules/calendarEvents';

const useStyles = makeStyles((theme) => ({
  allDayContainer: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    padding: theme.spacing(1),
    flexShrink: 0,
  },
  label: {},
  allDayListContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
}));

const AllDayEventsSection = ({ timestamp }) => {
  const classes = useStyles();
  const allDayCalendarEventIds = useSelector((state) =>
    selectAllDayCalendarEventIds(state, timestamp),
  );

  if (allDayCalendarEventIds.length === 0) {
    return null;
  }

  return (
    <Box className={classes.allDayContainer}>
      <TickLabel className={classes.label}>All day</TickLabel>
      <Box className={classes.allDayListContainer}>
        {allDayCalendarEventIds.map((calendarEventId, index) => (
          <CalendarEvent
            scrollAnchorRef={undefined}
            key={calendarEventId}
            index={index}
            id={calendarEventId}
            tickHeight={100} // irrelevant for allDay events
            ticksPerHour={1}
            interactive
            displayDateTimestamp={timestamp}
          />
        ))}
      </Box>
    </Box>
  );
};

AllDayEventsSection.propTypes = {
  timestamp: PropTypes.number.isRequired,
};
AllDayEventsSection.defaultProps = {};

export default AllDayEventsSection;
