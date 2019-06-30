import React from 'react';
import styled from 'styled-components';
import { Heading, Box } from 'rebass';
import { Link, withRouter } from 'react-router-dom';
import * as paths from '../../../constants/paths';
import NewTaskIcon from '../../icons/NewTaskIcon';
import UserIcon from '../../icons/UserIcon';

const HeaderContainer = styled(Box).attrs({
  p: 3,
  bg: 'appForeground',
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  font-family: ${props => props.theme.fonts.headline};
`;

const DashboardTitle = styled(Heading).attrs(() => ({
  color: 'textHighlight',
}))`
  flex-grow: 1;
  text-align: center;
`;

const titles = {
  [paths.SCHEDULED]: 'Scheduled',
  [paths.BLOCKED]: 'Blocked',
  [paths.IMPORTANT]: 'Important',
  [paths.BACKLOG]: 'Backlog',
  [paths.COMPLETED]: 'Completed',
  default: '',
};

export default withRouter(({ location }) => (
  <HeaderContainer>
    <Link to={paths.ACCOUNT}>
      <UserIcon />
    </Link>
    <DashboardTitle>{titles[location.pathname] || titles.default}</DashboardTitle>
    <Link to={paths.NEW_TASK}>
      <NewTaskIcon />
    </Link>
  </HeaderContainer>
));
