import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import TickIcon from '../icons/TickIcon';
import ButtonFunction from './ButtonFunction';

const Container = styled(Box).attrs({ pt: 3, pl: 3 })`
  position: absolute;
  top: 0;
  right: 0;
`;

const DoneButton = ({ onClick, buttonType, title }) => (
  <Container>
    <ButtonFunction type={buttonType} title={title}>
      <TickIcon onClick={onClick} size="small" />
    </ButtonFunction>
  </Container>
);

export default DoneButton;
