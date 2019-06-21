import { Box } from 'rebass';
import styled from 'styled-components';

export default styled(Box).attrs({
  appForeground: 2,
  p: 3,
})`
  width: 100%;
  height: 100%;
  position: relative; /* for absolute positioned things inside */
  overflow-y: hidden;
`;
