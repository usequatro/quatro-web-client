import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import uniqBy from 'lodash/uniqBy';

import format from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import startOfMinute from 'date-fns/startOfMinute';
import startOfDay from 'date-fns/startOfDay';
import addHours from 'date-fns/addHours';
import nextMonday from 'date-fns/nextMonday';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import { selectFormSnoozedUntil, setFormSnoozedUntil } from '../../../modules/taskForm';
import { useMixpanel } from '../../tracking/MixpanelContext';
import { SNOOZE_PRESET_SELECTED } from '../../../constants/mixpanelEvents';

const getOptions = (now) => {
  const oneHourFromNow = addHours(startOfMinute(now), 1).getTime();
  const threeHoursFromNow = addHours(startOfMinute(now), 3).getTime();
  const tomorrowMorningTimestamp = addHours(startOfTomorrow(), 9).getTime();
  const nextWeek = addHours(startOfDay(nextMonday(now)), 9).getTime();

  const options = [
    {
      value: oneHourFromNow,
      label: '1 hour from now',
      formattedValue: format(oneHourFromNow, 'h:mm a'),
    },
    {
      value: threeHoursFromNow,
      label: '3 hours from now',
      formattedValue: format(threeHoursFromNow, 'h:mm a'),
    },
    {
      value: tomorrowMorningTimestamp,
      label: 'Tomorrow morning',
      formattedValue: format(tomorrowMorningTimestamp, 'h:mm a'),
    },
    { value: nextWeek, label: 'Next week', formattedValue: format(nextWeek, 'PP - h:mm a') },
  ];
  return uniqBy(options, 'value');
};

const SnoozeMenu = ({ anchorEl, open, onClose, onCustomSelected }) => {
  const dispatch = useDispatch();
  const mixpanel = useMixpanel();

  const snoozedUntil = useSelector(selectFormSnoozedUntil);

  const options = getOptions(Date.now());

  const handleSelect = (timestamp, label) => {
    onClose();
    dispatch(setFormSnoozedUntil(timestamp));
    mixpanel.track(SNOOZE_PRESET_SELECTED, { selection: label, value: formatISO(timestamp) });
  };
  const handleClear = () => {
    onClose();
    dispatch(setFormSnoozedUntil(null));
  };
  const handleCustomSelected = () => {
    onClose();
    onCustomSelected();
  };

  const showCurrentOption =
    snoozedUntil &&
    snoozedUntil > Date.now() &&
    !options.map(({ value }) => value).includes(snoozedUntil);

  return (
    <Menu
      id="snooze-presets-menu"
      anchorEl={anchorEl}
      keepMounted
      open={open}
      onClose={onClose}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
    >
      <MenuItem selected={!snoozedUntil} onClick={handleClear} key="notSnoozed">
        Not snoozed
      </MenuItem>

      {options.map(({ value, label, formattedValue }) => (
        <MenuItem
          selected={snoozedUntil === value}
          onClick={() => handleSelect(value, label)}
          key={value}
        >
          {label}
          <Typography variant="body1" color="textSecondary" component="pre">
            {` (${formattedValue})`}
          </Typography>
        </MenuItem>
      ))}

      {showCurrentOption && (
        <MenuItem selected onClick={() => handleSelect(snoozedUntil)} key="current">
          Custom
          <Typography variant="body1" color="textSecondary" component="pre">
            {` (${format(snoozedUntil, 'PPPP, h:mm a')})`}
          </Typography>
        </MenuItem>
      )}
      <MenuItem onClick={handleCustomSelected} key="custom">
        Custom...
      </MenuItem>
    </Menu>
  );
};

SnoozeMenu.propTypes = {
  anchorEl: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCustomSelected: PropTypes.func.isRequired,
};

SnoozeMenu.defaultProps = {
  anchorEl: undefined,
};

export default SnoozeMenu;
