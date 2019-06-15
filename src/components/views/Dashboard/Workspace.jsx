import styled from 'styled-components';
import { Box } from 'rebass';

export default styled(Box).attrs({
  mx: 2,
  my: 3,
  px: 2,
  py: 3,
  bg: 'appForeground',
})`
    width: calc(100% - 2rem);
`;
