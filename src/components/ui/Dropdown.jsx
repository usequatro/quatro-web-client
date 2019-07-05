import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import FieldLabel from './FieldLabel';

const Container = styled(Box)`
  width: 100%;
`;
const Select = styled.select`
  font-size: inherit;
  width: 100%;
`;
const Option = styled.option`
  font-size: inherit;
`;

const Dropdown = ({
  label, value, onChange, children,
}) => (
  <Container as={label ? 'label' : 'div'}>
    {label && (
      <FieldLabel>{label}</FieldLabel>
    )}
    <Select
      onChange={event => onChange(event, event.target.value)}
      value={value === null ? '' : value}
    >
      <Option value="" disabled style={{ display: 'none' }} />
      {children}
    </Select>
  </Container>
);

Dropdown.Option = ({ value, children }) => (
  <Option key={value} value={value}>
    {children}
  </Option>
);

export default Dropdown;
