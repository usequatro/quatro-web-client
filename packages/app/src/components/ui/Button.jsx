import styled from 'styled-components';
import { Button } from 'rebass';

export default styled(Button).attrs(() => ({
  fontWeight: 'normal',
}))`
    padding: 1rem 3rem;
    outline-color: ${props => props.theme.colors.textHighlight};
`;
