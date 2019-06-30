// import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

export default styled(Box).attrs({ as: 'main' })`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;
