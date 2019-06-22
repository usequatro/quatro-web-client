import React from 'react';
import styled from 'styled-components';

const DIMENSIONS = {
  small: '1.5rem',
  medium: '3rem',
};

const Container = styled.div`
  width: ${props => DIMENSIONS[props.size]};
  height: ${props => DIMENSIONS[props.size]};
`;

export default Component => ({ size = 'medium', ...props }) => (
  <Container size={size}>
    <Component height="100%" width="100%" {...props} />
  </Container>
);
