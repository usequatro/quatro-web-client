import React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

export default ({ onChange, value }) => {
  const onCheckboxChange = event => onChange(event, Boolean(event.target.checked));
  return (
    <Input type="checkbox" value="1" checked={value} onChange={onCheckboxChange} />
  );
};
