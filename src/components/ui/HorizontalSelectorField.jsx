import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import FieldLabel from './FieldLabel';

const Button = styled.button`
  height: 2.5rem;
  flex-grow: 1;
  width: 100%;
  ${(props) => props.theme.buttons[props.variant]}
  font-size: 1rem;
`;
const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
`;
const ZeroWidthInputForFormValidation = styled.input`
  width: 0;
  opacity: 0;
`;

const HorizontalSelectorField = ({
  label, className, options, onChange, value, required, hiddenInputProps,
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
          <ZeroWidthInputForFormValidation
            {...hiddenInputProps}
            required={required}
            value={value}
            onChange={(event) => onSelection(event, event.target.value)}
          />
          {label}
        </FieldLabel>
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
