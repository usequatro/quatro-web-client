import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import isFriday from 'date-fns/isFriday';
import isMonday from 'date-fns/isMonday';
import isSaturday from 'date-fns/isSaturday';
import isSunday from 'date-fns/isSunday';
import isThursday from 'date-fns/isThursday';
import isTuesday from 'date-fns/isTuesday';
import isWednesday from 'date-fns/isWednesday';
import isEqual from 'lodash/isEqual';
import { DAY, MONTH, WEEK } from '../../../constants/recurringDurationUnits';
import * as WEEKDAYS from '../../../constants/weekdays';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';

const getPresetOptions = (referenceDate) =>
  [
    {
      key: 'everyDay',
      config: {
        unit: DAY,
        amount: 1,
      },
    },
    {
      key: 'weekdays',
      config: {
        unit: WEEK,
        amount: 1,
        activeWeekdays: {
          [WEEKDAYS.MONDAY]: true,
          [WEEKDAYS.TUESDAY]: true,
          [WEEKDAYS.WEDNESDAY]: true,
          [WEEKDAYS.THURSDAY]: true,
          [WEEKDAYS.FRIDAY]: true,
          [WEEKDAYS.SATURDAY]: false,
          [WEEKDAYS.SUNDAY]: false,
        },
      },
    },
    referenceDate && {
      key: 'onceWeekly',
      config: {
        unit: WEEK,
        amount: 1,
        activeWeekdays: {
          [WEEKDAYS.MONDAY]: isMonday(referenceDate),
          [WEEKDAYS.TUESDAY]: isTuesday(referenceDate),
          [WEEKDAYS.WEDNESDAY]: isWednesday(referenceDate),
          [WEEKDAYS.THURSDAY]: isThursday(referenceDate),
          [WEEKDAYS.FRIDAY]: isFriday(referenceDate),
          [WEEKDAYS.SATURDAY]: isSaturday(referenceDate),
          [WEEKDAYS.SUNDAY]: isSunday(referenceDate),
        },
      },
    },
    referenceDate && {
      key: 'monthly',
      config: {
        unit: MONTH,
        amount: 1,
      },
    },
  ].filter(Boolean);

const RecurringConfigMenu = ({
  anchorEl,
  referenceDate,
  currentRecurringConfig,
  onClose,
  onRepeatConfigChange,
  onCustomConfigSelected,
}) => {
  const presetOptions = useMemo(() => getPresetOptions(referenceDate), [referenceDate]);
  const customRecurringConfigIsntPreset = useMemo(
    () =>
      Boolean(
        currentRecurringConfig &&
          !presetOptions.reduce(
            (memo, { config }) =>
              memo ||
              (currentRecurringConfig.amount === config.amount &&
                currentRecurringConfig.unit === config.unit &&
                (config.unit !== WEEK ||
                  isEqual(
                    currentRecurringConfig.activeWeekdays || {},
                    config.activeWeekdays || {},
                  ))),
            false,
          ),
      ),
    [currentRecurringConfig, presetOptions],
  );

  return (
    <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}>
      <MenuItem
        onClick={() => {
          onRepeatConfigChange(null);
          onClose();
        }}
      >
        Don&apos;t repeat
      </MenuItem>
      {presetOptions.map((preset) => (
        <MenuItem
          key={preset.key}
          onClick={() => {
            onRepeatConfigChange(preset.config);
            onClose();
          }}
        >
          {preset.label || getUserFacingRecurringText(preset.config, referenceDate)}
        </MenuItem>
      ))}
      {customRecurringConfigIsntPreset && (
        <MenuItem
          onClick={() => {
            onClose();
          }}
          style={{ whiteSpace: 'normal' }}
        >
          {getUserFacingRecurringText(currentRecurringConfig, referenceDate)}
        </MenuItem>
      )}
      <MenuItem
        onClick={() => {
          onCustomConfigSelected();
          onClose();
        }}
      >
        Custom...
      </MenuItem>
    </Menu>
  );
};

RecurringConfigMenu.propTypes = {
  anchorEl: PropTypes.instanceOf(Element),
  referenceDate: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onRepeatConfigChange: PropTypes.func.isRequired,
  onCustomConfigSelected: PropTypes.func.isRequired,
  currentRecurringConfig: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

RecurringConfigMenu.defaultProps = {
  anchorEl: undefined,
  currentRecurringConfig: undefined,
  referenceDate: undefined,
};

export default RecurringConfigMenu;
