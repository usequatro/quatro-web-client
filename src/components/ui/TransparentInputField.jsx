import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import FieldLabel from 'components/ui/FieldLabel';
import FieldHelpText from 'components/ui/FieldHelpText';

const Input = styled.input`
  font-family: inherit;
  font-size: inherit;
  padding: 1rem 0.5rem 1rem 0.5rem;
  width: 100%;
  border: none;
  background-color: ${(props) => (props.disabled ? props.theme.colors.disabled : props.theme.colors.inputBackground)};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'auto')};
  -webkit-appearance: none;

  ::-webkit-input-placeholder { /* Edge */
    color: ${(props) => props.theme.colors.placeholder};
  }
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${(props) => props.theme.colors.placeholder};
  }
  ::placeholder {
    color: ${(props) => props.theme.colors.placeholder};
  }
`;

const InputField = forwardRef((
  {
    label,
    helpText,
    className,
    textarea,
    ...props
  },
  ref,
) => (
  <Box as={label ? 'label' : 'div'} className={className}>
    {label && (
      <FieldLabel>{label}</FieldLabel>
    )}
    {helpText && (
      <FieldHelpText>{helpText}</FieldHelpText>
    )}
    <Input
      ref={ref}
      as={textarea ? 'textarea' : 'input'}
      {...props} />
  </Box>
));

export default styled(InputField)``;
