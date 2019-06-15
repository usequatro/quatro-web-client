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
    <Link to="/dashboard/scheduled"><Icon>Sc</Icon></Link>
    <Link to="/dashboard/blocked"><Icon>Bl</Icon></Link>
    <Link to="/dashboard/important"><Icon>Im</Icon></Link>
    <Link to="/dashboard/backlog"><Icon>Ba</Icon></Link>
    <Link to="/dashboard/completed"><Icon>Co</Icon></Link>
  </FooterContainer>
);
