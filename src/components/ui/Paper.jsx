import { Box } from 'rebass';
import styled from 'styled-components';

export default styled(Box).attrs({
  appForeground: 2,
  p: 3,
})`
  width: 100vw;
  height: 100vh;
  position: relative; /* for absolute positioned things inside */
`;
