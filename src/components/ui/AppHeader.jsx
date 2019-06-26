import React from 'react';
import { Box, Heading } from 'rebass';
import styled from 'styled-components';

const AppHeaderContainer = styled(Box).attrs({
  p: 3,
  mb: 3,
  as: 'header',
})`
  position: relative;
`;

const AppHeader = props => (
  <Heading color="textHighlight" textAlign="center" fontFamily="headline" {...props} />
);

export {
  AppHeaderContainer,
  AppHeader,
};
