import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import CalendarEvent from '../event-card/CalendarEvent';
import PlaceholderCard from './PlaceholderCard';
import { selectCalendarEventIdsForDate } from '../../../modules/calendarEvents';

const useStyles = makeStyles(() => ({
  listContainer: {
    position: 'relative',
    alignSelf: 'flex-end',
    display: 'flex',
    justifyContent: 'flex-end',
  },
}));

const CalendarDayEventsList = ({
  firstEventCardScrollAnchorRef,
  timestamp,
  width,
  tickHeight,
  ticksPerHour,
  placeholder,
  interactive,
}) => {
  const classes = useStyles();
  const sortedCalendarEventIds = useSelector((state) =>
    selectCalendarEventIdsForDate(state, timestamp),
  );

  return (
    <Box className={classes.listContainer} width={width}>
      {sortedCalendarEventIds.map((calendarEventId, index) => (
        <CalendarEvent
          key={calendarEventId}
          scrollAnchorRef={index === 0 ? firstEventCardScrollAnchorRef : undefined}
          id={calendarEventId}
          index={index}
          tickHeight={tickHeight}
          ticksPerHour={ticksPerHour}
          interactive={interactive}
        />
      ))}

      {placeholder && (
        <PlaceholderCard
          start={placeholder.start}
          end={placeholder.end}
          tickHeight={tickHeight}
          ticksPerHour={ticksPerHour}
        />
      )}
    </Box>
  );
};

CalendarDayEventsList.propTypes = {
  firstEventCardScrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  timestamp: PropTypes.number.isRequired,
  tickHeight: PropTypes.number.isRequired,
  interactive: PropTypes.bool.isRequired,
  width: PropTypes.string,
  ticksPerHour: PropTypes.number.isRequired,
  placeholder: PropTypes.shape({
    start: PropTypes.number,
    end: PropTypes.number,
  }),
};
CalendarDayEventsList.defaultProps = {
  firstEventCardScrollAnchorRef: undefined,
  width: '85%',
  placeholder: undefined,
};

export default CalendarDayEventsList;
