import styled from 'styled-components';

export default styled.button.attrs((props) => ({
  fontWeight: 'body',
  type: props.type || 'button', // convenient to have it here, we can forget about it.
}))`
  outline-color: ${(props) => props.theme.colors.textHighlight};
  color: ${(props) => props.theme.colors.textHighlight};
  cursor: pointer;
  font-size: inherit;
  background-color: transparent;
  border: none;
  padding: 0;
`;
