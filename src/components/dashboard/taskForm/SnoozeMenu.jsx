import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import format from 'date-fns/format';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import addHours from 'date-fns/addHours';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import { selectSnoozedUntil, setSnoozedUntil } from '../../../modules/taskForm';

const SnoozeMenu = ({ anchorEl, open, onClose, onCustomSelected }) => {
  const dispatch = useDispatch();

  const snoozedUntil = useSelector(selectSnoozedUntil);

  const tomorrowMorningTimestamp = addHours(startOfTomorrow(), 9).getTime();
  const tomorrowAfternoonTimestamp = addHours(startOfTomorrow(), 14).getTime();

  const handleSelect = (timestamp) => {
    onClose();
    dispatch(setSnoozedUntil(timestamp));
  };
  const handleCustomSelected = () => {
    onClose();
    onCustomSelected();
  };

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
      <MenuItem selected={!snoozedUntil} onClick={() => handleSelect(null)}>
        Not snoozed
      </MenuItem>
      <MenuItem
        selected={snoozedUntil === tomorrowMorningTimestamp}
        onClick={() => handleSelect(tomorrowMorningTimestamp)}
      >
        Tomorrow morning (9 AM)
      </MenuItem>
      <MenuItem
        selected={snoozedUntil === tomorrowAfternoonTimestamp}
        onClick={() => handleSelect(tomorrowAfternoonTimestamp)}
      >
        Tomorrow afternoon (2 PM)
      </MenuItem>
      {snoozedUntil &&
        ![tomorrowMorningTimestamp, tomorrowAfternoonTimestamp].includes(snoozedUntil) && (
          <MenuItem selected onClick={() => handleSelect(snoozedUntil)}>
            {format(snoozedUntil, 'PPPP, h:mm a')}
          </MenuItem>
        )}
      <MenuItem onClick={handleCustomSelected}>Custom...</MenuItem>
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
