import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import TickIcon from 'components/icons/TickIcon';
import ButtonFunction from 'components/ui/ButtonFunction';

const Container = styled(Box).attrs({
  pt: 3,
  pr: 3,
})`
  position: absolute;
  top: 0;
  right: 0;
  color: ${(props) => props.theme.colors.textHighlight};
`;

const DoneButton = ({ onClick, buttonType, title }) => (
  <Container>
    <ButtonFunction type={buttonType} title={title} variant="text">
      <TickIcon onClick={onClick} size="small" />
    </ButtonFunction>
  </Container>
);

export default DoneButton;
