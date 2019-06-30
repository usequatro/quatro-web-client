import styled from 'styled-components';
import { Box } from 'rebass';

export default styled(Box).attrs({ as: 'form' })`
  display: inherit;
  flex-direction: inherit;
  justify-content: inherit;
  align-items: inherit;
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
`;
