import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import {
  selectCalendarIds,
  selectCalendarProviderCalendarId,
  selectCalendarName,
} from '../../../modules/calendars';

const CalendarName = ({ calendarId }) => {
  const providerCalendarId = useSelector(
    (state) =>
      selectCalendarName(state, calendarId) || selectCalendarProviderCalendarId(state, calendarId),
  );

  return providerCalendarId;
};
CalendarName.propTypes = {
  calendarId: PropTypes.string.isRequired,
};

const ConnectedCalendarSelect = ({ value, onChange, error }) => {
  const calendarIds = useSelector(selectCalendarIds);

  useEffect(() => {
    if (!value) {
      onChange(calendarIds[0]);
    }
  }, [value, calendarIds, onChange]);

  return (
    <FormControl fullWidth error={error}>
      <InputLabel id="connected-calendar-select">Calendar</InputLabel>
      <Select
        labelId="connected-calendar-select"
        value={value || ''}
        displayEmpty
        onChange={(event) => onChange(event.target.value)}
      >
        {calendarIds.map((id) => (
          <MenuItem value={id} key={id}>
            <CalendarName calendarId={id} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

ConnectedCalendarSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool.isRequired,
};

ConnectedCalendarSelect.defaultProps = {
  value: '',
};

export default ConnectedCalendarSelect;
