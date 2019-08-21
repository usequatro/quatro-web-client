import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

const Container = styled.div`
  display: inline-block;
  position: relative;
  width: 1rem;
  height: 1rem;
  margin: 0 0.5rem -1px 0;
`;
const ImprovedCheckbox = styled.div`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-style: solid;
  border-color: ${(props) => props.theme.colors.border};
  border-width: 1px;
  background-color: ${(props) => (props.checked ? props.theme.buttons.primary.backgroundColor : 'transparent')};

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.3rem;
    height: 0.6rem;
    border-style: solid;
    border-width: 0 2px 2px 0;
    border-color: ${(props) => props.theme.buttons.primary.color};
    transform: translate(-50%, -65%) rotate(40deg);
  }
`;
const Input = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:focus + ${ImprovedCheckbox} {
    outline: ${(props) => props.theme.colors.textHighlight} auto 2px;
  }
`;
const Label = styled(Box).attrs({
  as: 'label',
})`
  display: block;
  padding: 0.5rem 0;
`;

export default ({ onChange, value, label }) => (
  <Label>
    <Container>
      <Input
        type="checkbox"
        value="1"
        checked={value}
        onChange={(event) => onChange(event, Boolean(event.target.checked))}
      />
      <ImprovedCheckbox checked={value} />
    </Container>
    {label}
  </Label>
);
