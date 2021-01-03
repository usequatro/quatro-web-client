import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import EventCard from './EventCard';
import PlaceholderCard from './PlaceholderCard';
import { selectSortedCalendarEventIds } from '../../../modules/calendarEvents';

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
  date,
  width,
  tickHeight,
  ticksPerHour,
  placeholder,
  selectableEvents,
}) => {
  const classes = useStyles();
  const sortedCalendarEventIds = useSelector((state) => selectSortedCalendarEventIds(state, date));

  return (
    <Box className={classes.listContainer} width={width}>
      {sortedCalendarEventIds.map((calendarEventId, index) => (
        <EventCard
          key={calendarEventId}
          scrollAnchorRef={index === 0 ? firstEventCardScrollAnchorRef : undefined}
          id={calendarEventId}
          tickHeight={tickHeight}
          ticksPerHour={ticksPerHour}
          selectable={selectableEvents}
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
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number]).isRequired,
  tickHeight: PropTypes.number.isRequired,
  selectableEvents: PropTypes.bool.isRequired,
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
