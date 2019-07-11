import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

const ChildContainer = styled(Box).attrs({ mb: 4 })`
  width: 100%;
`;

const GroupContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const InputGroup = ({ children }) => (
  <GroupContainer>
    {React.Children.map(children, child => (
      <ChildContainer>
        {child}
      </ChildContainer>
    ))}
  </GroupContainer>
);

export default InputGroup;
