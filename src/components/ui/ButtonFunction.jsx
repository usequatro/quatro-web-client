import styled from 'styled-components';
import keyboardOnlyOutline from '../style-mixins/keyboardOnlyOutline';
import activeLighter from '../style-mixins/activeLighter';
import colorSmoothTransitions from '../style-mixins/colorSmoothTransitions';

const ButtonFunction = styled.button.attrs((props) => ({
  type: props.type || 'button',
}))`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  color: ${({ theme, variant }) => theme.buttons[variant].color};
  text-align: left;

  ${({ theme, variant }) => keyboardOnlyOutline(theme.buttons[variant].outlineColor)};

  ${activeLighter}

  transition: ${colorSmoothTransitions};
`;

export default ButtonFunction;
