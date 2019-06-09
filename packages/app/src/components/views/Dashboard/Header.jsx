import React from 'react';
import styled from 'styled-components';
import { Heading, Box } from 'rebass';
import { Link } from 'react-router-dom';

const HeaderContainer = styled(Box).attrs({
  px: 3,
  pb: 3,
  bg: 'appForeground',
})`
  display: flex;
  padding-top: 6vh;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const DashboardTitle = styled(Heading).attrs(() => ({
  color: 'textHighlight',
}))`
  flex-grow: 1;
  text-align: center;
`;

const ProfilePicture = styled.div`
  background-color: gray;
  border-radius: 100%;
  height: 3rem;
  width: 3rem;
`;

const NewTaskButton = styled.div`
  background-color: blue;
  height: 3rem;
  width: 3rem;
`;

export default () => (
  <HeaderContainer>
    <Link to="/profile">
      <ProfilePicture />
    </Link>
    <DashboardTitle>Important</DashboardTitle>
    <NewTaskButton />
  </HeaderContainer>
);
