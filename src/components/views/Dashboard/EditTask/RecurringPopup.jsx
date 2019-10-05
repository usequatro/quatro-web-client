import React, { useState, useCallback } from 'react';
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

const RecurringPopup = ({
  open,
  onClose,
  onDone,
  initialAmount = 1,
  initialUnit = DURATION_UNITS.DAY,
  initialActiveWeekdays,
}) => {
  const [durationUnit, setDurationUnit] = useState(initialUnit);
  const [durationAmount, setDurationAmount] = useState(initialAmount);
  const [activeWeekdays, setActiveWeekdays] = useState(Object.values(WEEKDAYS).reduce((memo, weekday) => ({
    ...memo,
    [weekday]: (initialActiveWeekdays || {})[weekday] || false,
  }), {}));

  const setActiveWeekday = (weekday, active) => {
    setActiveWeekdays({ ...activeWeekdays, [weekday]: Boolean(active) });
  };

  const handleDone = useCallback(() => {
    onClose(false);
    onDone({
      unit: durationUnit,
      amount: durationAmount,
      activeWeekdays: durationUnit === DURATION_UNITS.WEEK ? activeWeekdays : {},
    });
  }, [durationUnit, durationAmount, activeWeekdays, onClose, onDone]);

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
            onChange={(event) => setDurationAmount(event.target.value)}
            type="number"
            min="1"
            max="30"
          />
          <Dropdown value={durationUnit} onChange={(_, value) => setDurationUnit(value)}>
            <Dropdown.Option value={DURATION_UNITS.DAY}>{DURATION_UNITS.DAY}</Dropdown.Option>
            <Dropdown.Option value={DURATION_UNITS.WEEK}>{DURATION_UNITS.WEEK}</Dropdown.Option>
          </Dropdown>
        </RowBox>

        {durationUnit === DURATION_UNITS.WEEK && (
          <RowBox>
            {Object.values(WEEKDAYS).map((weekday) => (
              <BooleanCheckbox
                key={weekday}
                label={weekday}
                value={activeWeekdays[weekday]}
                onChange={(_, checked) => setActiveWeekday(weekday, checked)}
              >
                {weekday}
              </BooleanCheckbox>
            ))}
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
