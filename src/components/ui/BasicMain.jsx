// import React from 'react';
import styled from 'styled-components';
// @ts-ignore
import { Box } from 'rebass/styled-components';
import verticalScroll from 'components/style-mixins/verticalScroll';

export default styled(Box).attrs({ as: 'main' })`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  ${verticalScroll}
`;
