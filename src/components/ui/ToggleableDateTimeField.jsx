import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import dayjs from 'dayjs';

import BooleanCheckbox from './BooleanCheckbox';
import DateTimeField from './DateTimeField';

const Container = styled(Box).attrs({ mb: 2 })``;

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(17)
  .startOf('hour')
  .valueOf();

const ToggleableDateTimeField = ({
  value, label, helpText, onChange, disabled,
}) => {
  const [checked, setChecked] = useState(value != null && value !== '');

  return (
    <Container>
      <BooleanCheckbox
        onChange={(event, newChecked) => {
          setChecked(Boolean(newChecked));
          onChange(event, newChecked ? getInitialDueDate() : null);
        }}
        value={checked}
        label={label}
        helpText={helpText}
        disabled={disabled}
      />
      {checked && (
        <DateTimeField
          disabled={disabled}
          value={value}
          onChange={(event, newDateTime) => onChange(event, newDateTime)}
        />
      )}
    </Container>
  );
};

export default ToggleableDateTimeField;
