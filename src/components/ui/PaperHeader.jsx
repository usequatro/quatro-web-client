import React from 'react';
import { Box } from 'rebass';
import styled from 'styled-components';

import HeadingResponsive from './HeadingResponsive';

const PaperHeaderContainer = styled(Box).attrs({
  px: 3,
  py: 4,
  as: 'header',
  bg: 'barBackground',
})`
  position: relative;
`;

const SideContainer = styled(Box)`
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
`;

const ButtonLeftContainer = styled(SideContainer)`
  left: 0;
`;
const ButtonRightContainer = styled(SideContainer)`
  right: 0;
`;

const PapelHeader = ({ headline, buttonLeft, buttonRight }) => (
  <PaperHeaderContainer>
    {buttonLeft && (
      <ButtonLeftContainer>
        {buttonLeft}
      </ButtonLeftContainer>
    )}
    <HeadingResponsive
      color="textPrimaryOverBackground"
      textAlign="center"
      fontFamily="headline"
      fontWeight="normal"
    >
      {headline}
    </HeadingResponsive>
    {buttonRight && (
      <ButtonRightContainer>
        {buttonRight}
      </ButtonRightContainer>
    )}
  </PaperHeaderContainer>
);

export default PapelHeader;
