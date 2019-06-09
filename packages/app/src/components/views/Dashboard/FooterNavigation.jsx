import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Box } from 'rebass';

const FooterContainer = styled(Box).attrs({
  px: 2,
  py: 3,
  bg: 'appForeground',
})`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Icon = styled.div`
  background-color: gray;
  color: white;
  height: 3rem;
  width: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default () => (
  <FooterContainer>
    <Link to="/dashboard/important"><Icon>I</Icon></Link>
    <Link to="/dashboard/scheduled"><Icon>S</Icon></Link>
    <Link to="/dashboard/blocked"><Icon>B</Icon></Link>
    <Link to="/dashboard/completed"><Icon>C</Icon></Link>
  </FooterContainer>
);
