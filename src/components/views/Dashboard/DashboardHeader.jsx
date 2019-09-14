import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import { withRouter } from 'react-router-dom';
import invert from 'lodash/invert';

import StyledRouterLink from '../../ui/StyledRouterLink';
import HeadingResponsive from '../../ui/HeadingResponsive';
import * as paths from '../../../constants/paths';
import CheckListIcon from '../../icons/CheckListIcon';
import HamburgerIcon from '../../icons/HamburgerIcon';
import ButtonFunction from '../../ui/ButtonFunction';
import * as dashboardTabs from '../../../constants/dashboardTabs';
import { setAccountMenuOpen } from '../../../modules/dashboard';
import {
  selectNextTasks,
  selectScheduledTasks,
  selectBlockedTasks,
  selectCompletedTasks,
} from '../../../modules/tasks';
import { mediaVerySmall, mediaLarge } from '../../style-mixins/mediaQueries';

const PATHS_TO_DASHBOARD_TABS = invert(paths.DASHBOARD_TABS_TO_PATHS);

const HeaderContainer = styled(Box).attrs({
  bg: 'transparent',
})`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
`;

const HorizontalContainer = styled(Box).attrs({
  p: 4,
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;

  padding: ${({ theme }) => theme.space[5]};
  ${mediaVerySmall} {
    padding: ${({ theme }) => theme.space[3]};
  }
`;

const DashboardTitle = styled(HeadingResponsive).attrs(() => ({
  color: 'textPrimaryOverBackground',
  fontWeight: 'body',
}))`
  text-align: center;
  font-family: ${(props) => props.theme.fonts.heading};
  border: none;
  background-color: transparent;
  padding: 0 3rem;
  opacity: 0.8; /* to make it lighter */
`;
const SectionTitleContainer = styled(HeadingResponsive)`
  color: ${({ theme }) => theme.colors.textPrimaryOverBackground};
  text-align: center;

  padding-top: ${({ theme }) => theme.space[5]};
  padding-bottom: ${({ theme }) => theme.space[5]};
  ${mediaVerySmall} {
    padding-top: ${({ theme }) => theme.space[2]};
    padding-bottom: ${({ theme }) => theme.space[3]};
  }
  ${mediaLarge} {
    padding-top: ${({ theme }) => theme.space[7]};
  }
`;

const titles = {
  [dashboardTabs.SCHEDULED]: 'Scheduled',
  [dashboardTabs.BLOCKED]: 'Blocked',
  [dashboardTabs.NOW]: 'Now',
  [dashboardTabs.NEXT]: 'Next',
  [dashboardTabs.COMPLETED]: 'Completed',
  default: '',
};
const selectorByTab = {
  [dashboardTabs.NOW]: () => [],
  [dashboardTabs.NEXT]: selectNextTasks,
  [dashboardTabs.SCHEDULED]: selectScheduledTasks,
  [dashboardTabs.BLOCKED]: selectBlockedTasks,
  [dashboardTabs.COMPLETED]: selectCompletedTasks,
  default: () => [],
};

const DashboardHeader = ({ location }) => {
  const dispatch = useDispatch();
  const tab = PATHS_TO_DASHBOARD_TABS[location.pathname];
  const count = useSelector((state) => (selectorByTab[tab] || selectorByTab.default)(state).length);

  return (
    <HeaderContainer>
      <HorizontalContainer>
        <ButtonFunction
          onClick={() => dispatch(setAccountMenuOpen(true))}
          variant="textOverBackground"
        >
          <HamburgerIcon size="small" title="Menu" />
        </ButtonFunction>
        <DashboardTitle>
          Aizen
        </DashboardTitle>
        <StyledRouterLink
          to={paths.COMPLETED}
          variant="textOverBackground"
        >
          <CheckListIcon size="small" title="Completed Tasks" />
        </StyledRouterLink>
      </HorizontalContainer>
      <SectionTitleContainer>
        {titles[tab] || titles.default}
        {count && count > 0 ? ` (${count})` : ''}
      </SectionTitleContainer>
    </HeaderContainer>
  );
};

export default withRouter(DashboardHeader);