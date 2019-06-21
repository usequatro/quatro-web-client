import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import FieldLabel from './FieldLabel';

const Input = styled.input`
  font-size: inherit;
  padding: 1rem;
  width: 100%;
  border: solid 1px ${props => props.theme.colors.border};
  outline-color: ${props => props.theme.colors.textHighlight};
  background-color: ${props => (props.disabled ? props.theme.colors.disabled : props.theme.colors.inputBackground)};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'auto')};

  ::-webkit-input-placeholder { /* Edge */
    color: ${props => props.theme.colors.placeholder};
  }
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${props => props.theme.colors.placeholder};
  }
  ::placeholder {
    color: ${props => props.theme.colors.placeholder};
  }
`;

const InputField = ({
  label, className, textarea, ...props
}) => (
  <Box as={label ? 'label' : 'div'} className={className}>
    {label && (
      <FieldLabel>{label}</FieldLabel>
    )}
    <Input as={textarea ? 'textarea' : 'input'} {...props} />
  </Box>
);

export default styled(InputField)``;
