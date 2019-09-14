import styled from 'styled-components';
// @ts-ignore
import { Button } from 'rebass/styled-components';
import keyboardOnlyOutline from '../style-mixins/keyboardOnlyOutline';
import activeLighter from '../style-mixins/activeLighter';
import colorSmoothTransitions from '../style-mixins/colorSmoothTransitions';

export default styled(Button).attrs((props) => ({
  type: props.type || 'button', // convenient to have it here, we can forget about it.
  variant: props.variant || 'text', // default
  p: 0,
}))` 
  cursor: pointer;

  ${({ theme, variant }) => keyboardOnlyOutline(theme.buttons[variant].outlineColor)};

  ${activeLighter}

  transition: ${colorSmoothTransitions};
`;
