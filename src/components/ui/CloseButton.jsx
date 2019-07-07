import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import XIcon from '../icons/XIcon';
import BackIcon from '../icons/BackIcon';
import ButtonFunction from './ButtonFunction';

const Container = styled(Box).attrs({ pt: 3, pl: 3 })`
  position: absolute;
  top: 0;
  left: 0;
`;

const CloseButton = ({ onClick, backArrow }) => (
  <Container>
    <ButtonFunction>
      {backArrow
        ? <BackIcon onClick={onClick} size="small" />
        : <XIcon onClick={onClick} size="small" />
      }
    </ButtonFunction>
  </Container>
);

export default CloseButton;
