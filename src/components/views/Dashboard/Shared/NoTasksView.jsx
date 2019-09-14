import React from 'react';
import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

const Container = styled(Box).attrs({
  py: 7,
})`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ({ message = 'No tasks' }) => (
  <Container><p>{message}</p></Container>
);
