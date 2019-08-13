import styled from 'styled-components';

const ButtonFunctionality = styled.button.attrs(props => ({
  type: props.type || 'button',
}))`
  background: transparent;
  border: none;
  outline-color: ${props => props.theme.colors.textHighlight};
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  color: inherit;
  text-align: left;
  transition: color 150ms;

  &:active {
    color: ${props => props.theme.colors.textHighlight};
  }
  &:hover {
    color: ${props => props.theme.colors.textHighlight};
  }
`;

export default ButtonFunctionality;
