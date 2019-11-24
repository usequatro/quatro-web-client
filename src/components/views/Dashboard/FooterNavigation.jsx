import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Box } from 'rebass/styled-components';
import invert from 'lodash/invert';

import { DASHBOARD_TABS_TO_PATHS, NEW_TASK } from 'constants/paths';
import * as dashboardTabs from 'constants/dashboardTabs';

import BacklogIcon from 'components/icons/Backlog';
import BlockedIcon from 'components/icons/Blocked';
import CalendarIcon from 'components/icons/Calendar';
import PlusIcon from 'components/icons/PlusIcon';
import TopFourIcon from 'components/icons/TopFour';

import keyboardOnlyOutline from 'components/style-mixins/keyboardOnlyOutline';
import activeLighter from 'components/style-mixins/activeLighter';
import { mediaVerySmall, mediaLarge } from 'components/style-mixins/mediaQueries';

const PATHS_TO_DASHBOARD_TABS = invert(DASHBOARD_TABS_TO_PATHS);

const FooterContainer = styled(Box).attrs({
  px: 2,
  py: 2,
  bg: 'barBackground',
})`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
`;

const NavButton = styled.button.attrs({ type: 'primary' })`
  color: ${({ theme }) => theme.colors.textPrimaryOverBackground};
  opacity: ${({ selected }) => selected ? 1 : 0.5};
  font-weight: ${({ selected }) => selected ? 'bold' : 'normal'};
  display: flex;
  flex-basis: 0;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  width: 0; /* trickery to make it look good on small screens */
  min-width: 55px; /* makes Top 4 appear on one line. @TODO: Find a better way to do this */
  flex-shrink: 0;

  ${(props) => keyboardOnlyOutline(props.theme.colors.textHighlight)};
  ${activeLighter}
`;

const NavIconContainer = styled.div`
  width: 2rem;
  height: 2rem;
  background-color: white;
  border-radius: 100%;
  margin-bottom: 0.5rem;
  position: relative;
`;

const NavIcon = styled.div`
  width: 50%;
  position: absolute;
  top: 25%;
  left: 25%;
`;

const Label = styled.div`
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  overflow: -webkit-paged-x; /* weird thing for safari to render labels outside width */
  ${mediaVerySmall} {
    font-size: ${({ theme }) => theme.fontSizes[0]};
  }
  ${mediaLarge} {
    font-size: ${({ theme }) => theme.fontSizes[2]};
  }
`;

const NewTaskButtonContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;

  height: 3.5rem;
  width: 3.5rem;  
  ${mediaVerySmall} {
    height: 3rem;
    width: 3rem;
  }
`;

const NewTaskButton = styled.button`
  background-color: ${(props) => props.theme.colors.appForeground};

  height: 100%;
  width: 100%;

  border-radius: 100%;
  padding: 0;
  color: ${(props) => props.theme.colors.textHighlight};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;

  ${(props) => keyboardOnlyOutline(props.theme.colors.appForeground)};
  ${activeLighter}
`;

const FooterNavigation = ({
  history,
}) => {
  const currentTab = PATHS_TO_DASHBOARD_TABS[history.location.pathname];
  const handleNavigation = (tab) => history.push(DASHBOARD_TABS_TO_PATHS[tab]);

  return (
    <FooterContainer>
      {/* Top Four */}
      <NavButton
        selected={currentTab === dashboardTabs.NOW}
        onClick={() => handleNavigation(dashboardTabs.NOW)}
      >
        <NavIconContainer>
          <NavIcon>
            <TopFourIcon size="fill" title="Top 4" />
          </NavIcon>
        </NavIconContainer>
        <Label>Top 4</Label>
      </NavButton>

      {/* Backlog */}
      <NavButton
        selected={currentTab === dashboardTabs.NEXT}
        onClick={() => handleNavigation(dashboardTabs.NEXT)}
      >
        <NavIconContainer>
          <NavIcon>
            <BacklogIcon size="fill" title="Backlog" />
          </NavIcon>
        </NavIconContainer>
        <Label>Backlog</Label>
      </NavButton>

      {/* New Task Button */}
      <NewTaskButtonContainer>
        <NewTaskButton onClick={() => history.push(NEW_TASK)}>
          <PlusIcon size="fill" title="New Task" />
        </NewTaskButton>
      </NewTaskButtonContainer>

      {/* Calendar */}
      <NavButton
        selected={currentTab === dashboardTabs.SCHEDULED}
        onClick={() => handleNavigation(dashboardTabs.SCHEDULED)}
      >
        <NavIconContainer>
          <NavIcon>
            <CalendarIcon size="fill" title="Calendar" />
          </NavIcon>
        </NavIconContainer>
        <Label>Calendar</Label>
      </NavButton>

      {/* Blocked */}
      <NavButton
        selected={currentTab === dashboardTabs.BLOCKED}
        onClick={() => handleNavigation(dashboardTabs.BLOCKED)}
      >
        <NavIconContainer>
          <NavIcon>
            <BlockedIcon size="fill" title="Blocked" />
          </NavIcon>
        </NavIconContainer>
        <Label>Blocked</Label>
      </NavButton>
    </FooterContainer>
  );
};

export default withRouter(FooterNavigation);
