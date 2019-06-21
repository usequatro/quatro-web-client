import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import XIcon from '../icons/XIcon';
import BackIcon from '../icons/BackIcon';

const Container = styled(Box).attrs({ pt: 3 })`
  position: absolute;
  top: 0;
  left: 0;
`;

const CloseButton = ({ onClick, backArrow }) => (
  <Container>
    {backArrow
      ? <BackIcon onClick={onClick} size="small" />
      : <XIcon onClick={onClick} size="small" />
    }
  </Container>
);

export default CloseButton;
