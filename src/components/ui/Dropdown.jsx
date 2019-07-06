import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import FieldLabel from './FieldLabel';

const Container = styled(Box)`
  width: 100%;
`;
const arrowColor = '000000';
const Select = styled.select`
  font-size: inherit;
  padding: 1rem;
  text-align: left;
  border-radius: 0;
  appearance: none;
  border: solid 1px ${props => props.theme.colors.border};
  outline-color: ${props => props.theme.colors.textHighlight};
  background-color: ${props => (props.disabled ? props.theme.colors.disabled : props.theme.colors.inputBackground)};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'auto')};
  width: 100%;

  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${arrowColor}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'),
    linear-gradient(to bottom, #ffffff 0%,#ffffff 100%);
  background-repeat: no-repeat, repeat;
  background-position: right .7em top 50%, 0 0;
  background-size: .65em auto, 100%;

  &:after {
    content: '';
  }
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
