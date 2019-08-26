import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import FieldLabel from './FieldLabel';
import FieldHelpText from './FieldHelpText';
import keyboardOnlyOutline from '../style-mixins/keyboardOnlyOutline';
import activeLighter from '../style-mixins/activeLighter';
import colorSmoothTransitions from '../style-mixins/colorSmoothTransitions';

const Button = styled.button`
  height: 2.5rem;
  flex-grow: 1;
  width: 100%;
  ${(props) => props.theme.buttons[props.variant]}
  font-size: 1rem;
  cursor: pointer;

  ${(props) => keyboardOnlyOutline(props.theme.buttons[props.variant].outlineColor)};
  ${activeLighter}

  transition: ${colorSmoothTransitions};
`;
const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
`;
const ZeroWidthInputForFormValidation = styled.input`
  width: 1px;
  opacity: 0;
  padding: 0;
  margin: 0;
  border: none;
  background-color: transparent;
`;

const HorizontalSelectorField = ({
  label, helpText, className, options, onChange, value, required, hiddenInputProps,
}) => {
  const onSelection = (event, optionValue) => {
    // for Safari iOS at least.
    event.stopPropagation();
    event.preventDefault();

    onChange(event, optionValue);
  };
  return (
    <Box as={label ? 'label' : 'div'} className={className}>
      {label && (
        <FieldLabel>
          {label}
          <ZeroWidthInputForFormValidation
            {...hiddenInputProps}
            required={required}
            value={value}
            onChange={(event) => onSelection(event, event.target.value)}
            tabIndex="-1" /* this is for HTML5 validation, not for tabbing */
          />
        </FieldLabel>
      )}
      {helpText && (
        <FieldHelpText>{helpText}</FieldHelpText>
      )}
      <ButtonsContainer>
        {options.map(({ value: optionValue, label: optionLabel = `${optionValue}` }) => (
          <Button
            key={optionValue}
            onClick={(e) => onSelection(e, optionValue)}
            data-value={optionValue}
            variant={`${value}` === `${optionValue}` ? 'primary' : 'outline'}
            type="button"
          >
            {optionLabel}
          </Button>
        ))}
      </ButtonsContainer>
    </Box>
  );
};

export default styled(HorizontalSelectorField)``;
