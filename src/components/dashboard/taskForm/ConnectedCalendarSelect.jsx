import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { selectCalendarIds, selectCalendarProviderCalendarId } from '../../../modules/calendars';

const ProviderCalendarId = ({ calendarId }) => {
  const providerCalendarId = useSelector((state) =>
    selectCalendarProviderCalendarId(state, calendarId),
  );

  return providerCalendarId;
};
ProviderCalendarId.propTypes = {
  calendarId: PropTypes.string.isRequired,
};

const ConnectedCalendarSelect = ({ value, onChange }) => {
  const calendarIds = useSelector(selectCalendarIds);

  useEffect(() => {
    if (!value) {
      onChange(calendarIds[0]);
    }
  }, [value, calendarIds, onChange]);

  return (
    <FormControl margin="normal" fullWidth>
      <InputLabel id="connected-calendar-select">Calendar</InputLabel>
      <Select
        labelId="connected-calendar-select"
        value={value || ''}
        displayEmpty
        onChange={(event) => onChange(event.target.value)}
      >
        {calendarIds.map((id) => (
          <MenuItem value={id} key={id}>
            <ProviderCalendarId calendarId={id} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

ConnectedCalendarSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ConnectedCalendarSelect.defaultProps = {
  value: '',
};

export default ConnectedCalendarSelect;
