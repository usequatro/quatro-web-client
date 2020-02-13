import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import { withRouter } from 'react-router-dom';
import invert from 'lodash/invert';

import * as paths from 'constants/paths';
import * as dashboardTabs from 'constants/dashboardTabs';
import { setAccountMenuOpen } from 'modules/dashboard';

import StyledRouterLink from 'components/ui/StyledRouterLink';
import HeadingResponsive from 'components/ui/HeadingResponsive';
import CheckListIcon from 'components/icons/CheckListIcon';
import HamburgerIcon from 'components/icons/HamburgerIcon';
import LogoIcon from 'components/icons/Logo';
import BacklogIcon from 'components/icons/Backlog';
import BlockedIcon from 'components/icons/Blocked';
import CalendarIcon from 'components/icons/Calendar';
import TopFourIcon from 'components/icons/TopFour';
import ButtonFunction from 'components/ui/ButtonFunction';
import { mediaVerySmall } from 'components/style-mixins/mediaQueries';

const PATHS_TO_DASHBOARD_TABS = invert(paths.DASHBOARD_TABS_TO_PATHS);

// @TODO: See if we can avoid needing to hard code this height.
const HEADER_HEIGHT = '90px';
const HEADER_HEIGHT_VERY_SMALL = '60px';

const HeaderContainer = styled(Box).attrs({
  bg: 'transparent',
})`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  height: ${HEADER_HEIGHT};
  ${mediaVerySmall} {
    height: ${HEADER_HEIGHT_VERY_SMALL};
  }
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
  position: relative;
  top: -0.5rem;
`;
const SectionTitleContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.textPrimaryOverBackground};
  padding: ${({ theme }) => `${theme.space[3]} 0`};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.colors.border}`};
  ${mediaVerySmall} {
    padding: ${({ theme }) => `${theme.space[2]} 0`};
  }
`;

const SectionTitle = styled(HeadingResponsive)`
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: ${({ theme }) => theme.letterSpacings.large};
  text-align: center;
  font-weight: bold;
`

// @TODO: Figure out a better way to style this header without needing
// to hard code a pixel width.
const SectionIconContainer = styled.div`
  width: 30px;
  margin: ${({ theme }) => `0 ${theme.space[3]}`};
`;

const titles = {
  [dashboardTabs.SCHEDULED]: 'Scheduled',
  [dashboardTabs.BLOCKED]: 'Blocked',
  [dashboardTabs.NOW]: 'Top 4',
  [dashboardTabs.NEXT]: 'Backlog',
  [dashboardTabs.COMPLETED]: 'Completed',
  default: '',
};

const iconsByTab = {
  [dashboardTabs.NOW]: TopFourIcon,
  [dashboardTabs.NEXT]: BacklogIcon,
  [dashboardTabs.SCHEDULED]: CalendarIcon,
  [dashboardTabs.BLOCKED]: BlockedIcon,
  [dashboardTabs.COMPLETED]: CalendarIcon,
  default: TopFourIcon,
}

const DashboardHeader = ({ location }) => {
  const dispatch = useDispatch();
  const tab = PATHS_TO_DASHBOARD_TABS[location.pathname];

  const CurrentTabIcon = iconsByTab[tab];

  return (
    <div>
      <HeaderContainer>
        <HorizontalContainer>
          <ButtonFunction
            onClick={() => dispatch(setAccountMenuOpen(true))}
            variant="textOverBackground"
          >
            <HamburgerIcon size="small" title="Menu" />
          </ButtonFunction>
          <DashboardTitle>
            <LogoIcon size="medium" title="Quatro Logo" />
          </DashboardTitle>

          {/* If we're on the completed screen, link back to Top 4 */}
          {tab === dashboardTabs.COMPLETED && (
            <StyledRouterLink
              to={paths.NOW}
              variant="textOverBackground"
            >
              <CheckListIcon size="small" title={titles[dashboardTabs.NOW]} />
            </StyledRouterLink>
          )}

          {/* Otherwise, link to the completed screen */}
          {tab !== dashboardTabs.COMPLETED && (
            <StyledRouterLink
              to={paths.COMPLETED}
              variant="textOverBackground"
            >
              <CheckListIcon size="small" title={titles[dashboardTabs.COMPLETED]} />
            </StyledRouterLink>
          )}
        </HorizontalContainer>
      </HeaderContainer>

      <SectionTitleContainer>
        {iconsByTab[tab] && (
          <SectionIconContainer>
            <CurrentTabIcon size="fill" alt={titles[tab]} />
          </SectionIconContainer>
        )}
        <SectionTitle>
          {titles[tab] || titles.default}
        </SectionTitle>
      </SectionTitleContainer>
    </div>
  );
};

export default withRouter(DashboardHeader);
