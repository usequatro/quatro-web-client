import React from 'react';
import styled from 'styled-components';
// @ts-ignore
import { Box } from 'rebass/styled-components';

import FieldLabel from 'components/ui/FieldLabel';
import FieldHelpText from 'components/ui/FieldHelpText';
import { activeOpacity } from 'components/style-mixins/activeLighter';
import colorSmoothTransitions from 'components/style-mixins/colorSmoothTransitions';

const Container = styled.div`
  position: relative;
  width: 1rem;
  height: 1rem;
  margin: 0 0.5rem -1px 0;
  flex-shrink: 0;
`;
const ImprovedCheckbox = styled.div<{ checked: boolean, disabled?: boolean }>`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-style: solid;
  border-color: ${({ checked, theme }) => (checked ? theme.buttons.primary.color : theme.colors.border)};
  border-width: 1px;
  background-color: ${(props) => (props.checked ? props.theme.buttons.primary.backgroundColor : 'transparent')};
  transition: ${colorSmoothTransitions};

  opacity: ${(props) => (props.disabled ? '0.5' : '1')};

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

  &:focus-visible + ${ImprovedCheckbox} {
    outline: ${(props) => props.theme.colors.textHighlight} auto 2px;
  }
  &:active + ${ImprovedCheckbox} {
    opacity: ${activeOpacity};
  }
`;
const HorizontalContainer = styled.div`
  display: flex;
`;
const Label = styled(Box).attrs({
  as: 'label',
})`
  flex-grow: 1;
  padding: 0.5rem 0;
`;

type BooleanCheckboxProps = {
  onChange: Function,
  value: boolean,
  label: string,
  helpText?: string,
  disabled?: boolean,
};

const BooleanCheckbox: React.FC<BooleanCheckboxProps> = ({
  onChange, value, label, helpText, disabled,
}) => (
    <Label>
      <HorizontalContainer>
        <Container>
          <Input
            type="checkbox"
            value="1"
            checked={value}
            disabled={disabled}
            onChange={(event) => onChange(event, Boolean(event.target.checked))}
          />
          <ImprovedCheckbox checked={value} disabled={disabled} />
        </Container>
        <FieldLabel>{label}</FieldLabel>
      </HorizontalContainer>
      {helpText && (
        <FieldHelpText>{helpText}</FieldHelpText>
      )}
    </Label>
  );

export default BooleanCheckbox;
