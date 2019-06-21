import React from 'react';
import styled from 'styled-components';

const TopRightButton = styled.button`
  position: absolute;
  top: 0;
  left: 0;
  font-size: 2rem;
  cursor: pointer;
`;

const CloseButton = ({ onClick, backArrow }) => (
  <TopRightButton type="button" onClick={onClick}>
    {backArrow ? '←' : 'x'}
  </TopRightButton>
);

export default CloseButton;
