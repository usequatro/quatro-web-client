import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default styled(Link)`
  outline-color: ${props => props.theme.colors.textHighlight};
  cursor: pointer;
  transition: color 150ms;

  &:active {
    color: ${props => props.theme.colors.textHighlight};
  }
  &:hover {
    color: ${props => props.theme.colors.textHighlight};
  }
`;
