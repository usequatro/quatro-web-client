import React, { useState } from 'react';
import { Heading, Box } from 'rebass/styled-components';
import styled from 'styled-components';

import Popup from '../../../ui/Popup';
import InputField from '../../../ui/InputField';
import BooleanCheckbox from '../../../ui/BooleanCheckbox';
import ButtonInline from '../../../ui/ButtonInline';
import * as DURATION_UNITS from '../../../../constants/recurringDurationUnits';
import * as WEEKDAYS from '../../../../constants/weekdays';
import Dropdown from '../../../ui/Dropdown';

const RowBox = styled(Box).attrs({ pb: 4 })`
  display: flex;
`;

const RecurringPopup = ({ open, onClose, onDone }) => {
  const [durationUnit, setDurationUnit] = useState(DURATION_UNITS.DAY);
  const [durationAmount, setDurationAmount] = useState(1);
  const [activeWeekdays, setActiveWeekdays] = useState(
    Object.values(WEEKDAYS).reduce((memo, weekday) => ({
      ...memo,
      [weekday]: false,
    }), {}),
  );

  const setActiveWeekday = (weekday, active) => {
    setActiveWeekdays({ ...activeWeekdays, [weekday]: Boolean(active) });
  };

  const handleDone = () => {
    onClose(false);
    onDone({
      unit: durationUnit,
      duration: durationAmount,
      activeWeekdays: durationUnit === DURATION_UNITS.WEEK ? activeWeekdays : {},
    });
  };

  return (
    <Popup open={open}>
      <Popup.Header>
        <Heading>Recurring</Heading>
      </Popup.Header>
      <Popup.Content>
        <RowBox>
          Repeats every
          <InputField
            value={durationAmount}
            onChange={(_, value) => setDurationAmount(value)}
            type="number"
            min="1"
            max="30"
          />
          <Dropdown value={durationUnit} onChange={(_, value) => setDurationUnit(value)}>
            {Object.values(DURATION_UNITS).map((unit) => (
              <Dropdown.Option key={unit} value={unit}>{unit}</Dropdown.Option>
            ))}
          </Dropdown>
        </RowBox>

        {durationUnit === DURATION_UNITS.WEEK && (
          <RowBox>
            {Object.values(WEEKDAYS).map((weekday) => (
              <BooleanCheckbox
                key={weekday}
                label={weekday}
                value={activeWeekdays[weekday]}
                onChange={(_, value) => setActiveWeekday(weekday, value)}
              >
                {weekday}
              </BooleanCheckbox>
            ))}
          </RowBox>
        )}

        {durationUnit === DURATION_UNITS.MONTH && (
          <RowBox>
            Month chooser, work in progress
          </RowBox>
        )}
      </Popup.Content>
      <Popup.Footer>
        <ButtonInline onClick={() => onClose(false)}>Cancel</ButtonInline>
        <ButtonInline onClick={() => handleDone()}>Done</ButtonInline>
      </Popup.Footer>
    </Popup>
  );
};

export default RecurringPopup;
