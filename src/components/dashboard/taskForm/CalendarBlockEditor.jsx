import React from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';

import CalendarSchedulingThumbnail from './CalendarSchedulingThumbnail';
import DurationField from './DurationField';
import ConnectedCalendarSelect from './ConnectedCalendarSelect';

export const ERROR_BAD_DURATION = 'badDuration';
export const ERROR_NO_CALENDAR_ID = 'noCalendarId';
export const ERROR_UNKNOWN_CALENDAR_ID = 'unknownCalendarId';

const CalendarBlockEditor = ({
  startDateTimestamp,
  onChangeStartDateTimestamp,
  duration,
  onDurationChange,
  calendarId,
  onCalendarIdChange,
  errors,
}) => (
  <Box display="flex" mb={1} flexDirection="column">
    <Box ml={1} mb={2} display="flex" alignItems="center">
      <DurationField
        duration={duration}
        onChange={onDurationChange}
        error={errors.includes(ERROR_BAD_DURATION)}
      />

      <Box ml={2} />

      <ConnectedCalendarSelect
        value={calendarId}
        onChange={onCalendarIdChange}
        error={errors.includes(ERROR_NO_CALENDAR_ID) || errors.includes(ERROR_UNKNOWN_CALENDAR_ID)}
      />
    </Box>

    <CalendarSchedulingThumbnail
      startDateTimestamp={startDateTimestamp}
      duration={duration}
      onChangeStartDateTimestamp={onChangeStartDateTimestamp}
    />
  </Box>
);

CalendarBlockEditor.propTypes = {
  startDateTimestamp: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  calendarId: PropTypes.string,
  onChangeStartDateTimestamp: PropTypes.func.isRequired,
  onDurationChange: PropTypes.func.isRequired,
  onCalendarIdChange: PropTypes.func.isRequired,
  errors: PropTypes.arrayOf(
    PropTypes.oneOf([ERROR_BAD_DURATION, ERROR_NO_CALENDAR_ID, ERROR_UNKNOWN_CALENDAR_ID]),
  ).isRequired,
};

CalendarBlockEditor.defaultProps = {
  calendarId: undefined,
};

export default CalendarBlockEditor;
