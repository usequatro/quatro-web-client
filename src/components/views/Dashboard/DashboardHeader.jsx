import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import { withRouter } from 'react-router-dom';
import invert from 'lodash/invert';

import * as paths from 'constants/paths';
import * as dashboardTabs from 'constants/dashboardTabs';
import { setAccountMenuOpen } from 'modules/dashboard';
import {
  selectNextTasks,
  selectScheduledTasks,
  selectBlockedTasks,
  selectCompletedTasks,
} from 'modules/tasks';

import StyledRouterLink from 'components/ui/StyledRouterLink';
import HeadingResponsive from 'components/ui/HeadingResponsive';
import CheckListIcon from 'components/icons/CheckListIcon';
import HamburgerIcon from 'components/icons/HamburgerIcon';
import LogoIcon from 'components/icons/Logo';
import ButtonFunction from 'components/ui/ButtonFunction';
import { mediaVerySmall, mediaLarge } from 'components/style-mixins/mediaQueries';

const PATHS_TO_DASHBOARD_TABS = invert(paths.DASHBOARD_TABS_TO_PATHS);
const HEADER_HEIGHT = '90px';

const HeaderContainer = styled(Box).attrs({
  bg: 'transparent',
})`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  height: ${HEADER_HEIGHT};
`;

const HorizontalContainer = styled(Box).attrs({
  p: 4,
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  height: 100%;

  padding: ${({ theme }) => theme.space[5]};
  ${mediaVerySmall} {
    padding: ${({ theme }) => theme.space[3]};
  }
`;

const DashboardTitle = styled.div`
  text-align: center;
  height: 100%;
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
  [dashboardTabs.SCHEDULED]: 'Calendar',
  [dashboardTabs.BLOCKED]: 'Blocked',
  [dashboardTabs.NOW]: 'Top 4',
  [dashboardTabs.NEXT]: 'Backlog',
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
          <LogoIcon size="fill" title="Aizen Logo" />
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
