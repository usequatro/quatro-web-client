import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

import BooleanCheckbox from './BooleanCheckbox';

const Container = styled(Box).attrs({ mb: 2 })``;

const ToggleableFieldWrapper = ({
  defaultChecked, label, helpText, onChange, disabled, children,
}) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <Container>
      <BooleanCheckbox
        onChange={(event, newChecked) => {
          setChecked(Boolean(newChecked));
          onChange(event, newChecked);
        }}
        value={checked}
        label={label}
        helpText={helpText}
        disabled={disabled}
      />
      {checked ? children : null}
    </Container>
  );
};

export default ToggleableFieldWrapper;
