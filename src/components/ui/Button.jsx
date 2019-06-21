import styled from 'styled-components';
import { Button } from 'rebass';

export default styled(Button).attrs(props => ({
  fontWeight: 'normal',
  type: props.type || 'button', // convenient to have it here, we can forget about it.
  variant: props.variant || 'primary', // default
}))`
  padding: 1rem 3rem;
  outline-color: ${props => props.theme.colors.textHighlight};
  cursor: pointer;
`;
