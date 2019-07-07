import styled from 'styled-components';

const ButtonFunctionality = styled.button.attrs({ type: 'button' })`
  background: transparent;
  border: none;
  outline-color: ${props => props.theme.colors.textHighlight};
  cursor: pointer;
  font-size: inherit;
  padding: 0;
  color: inherit;
`;

export default ButtonFunctionality;
