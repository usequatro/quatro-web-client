import React from 'react';
import styled from 'styled-components';

const TopRightButton = styled.button.attrs()`
  position: absolute;
  margin: 0.5rem 0.5rem 0 0;
  top: 0;
  right: 0;
  font-size: 2rem;
`;

const CloseButton = ({ onClick }) => (
  <TopRightButton type="button" onClick={onClick}>x</TopRightButton>
);

export default CloseButton;
