import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

export default styled(Box).attrs({
  bg: 'appForeground',
  p: 3,
})`
  width: 100%;
  height: 100%;
  position: relative; /* for absolute positioned things inside */
  overflow-y: hidden;
`;
