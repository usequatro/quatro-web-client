import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

import CalendarSchedulingThumbnail from './CalendarSchedulingThumbnail';
import DurationField from './DurationField';
import ConnectedCalendarSelect from './ConnectedCalendarSelect';

const CalendarBlockEditor = ({
  startDateTimestamp,
  onChangeStartDateTimestamp,
  duration,
  onDurationChange,
  calendarId,
  onCalendarIdChange,
}) => {
  return (
    <Box display="flex" mb={1}>
      <CalendarSchedulingThumbnail
        startDateTimestamp={startDateTimestamp}
        duration={duration}
        onChangeStartDateTimestamp={onChangeStartDateTimestamp}
      />

      <Box ml={1} width="6rem" display="flex" flexDirection="column">
        <DurationField duration={duration} onChange={onDurationChange} />

        <ConnectedCalendarSelect value={calendarId} onChange={onCalendarIdChange} />
      </Box>
    </Box>
  );
};

CalendarBlockEditor.propTypes = {
  startDateTimestamp: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  calendarId: PropTypes.string,
  onChangeStartDateTimestamp: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onCalendarIdChange: PropTypes.func.isRequired,
};

CalendarBlockEditor.defaultProps = {
  calendarId: undefined,
};

export default CalendarBlockEditor;
