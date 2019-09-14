import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Box } from 'rebass/styled-components';
import invert from 'lodash/invert';
import { DASHBOARD_TABS_TO_PATHS, NEW_TASK } from '../../../constants/paths';
import * as dashboardTabs from '../../../constants/dashboardTabs';
import PlusIcon from '../../icons/PlusIcon';
import keyboardOnlyOutline from '../../style-mixins/keyboardOnlyOutline';
import activeLighter from '../../style-mixins/activeLighter';
import { mediaVerySmall, mediaLarge } from '../../style-mixins/mediaQueries';

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
  color: ${({ theme, selected }) => (selected ? theme.colors.textPrimaryOverBackground : theme.colors.textHighlight)};
  display: flex;
  flex-basis: 0;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background-color: transparent;
  border: none;
  width: 0; /* trickery to make it look good on small screens */
  flex-shrink: 0;

  ${(props) => keyboardOnlyOutline(props.theme.colors.textHighlight)};
  ${activeLighter}
`;
const Circle = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  background-color: currentColor;
  border-radius: 100%;
  margin-bottom: 0.5rem;
`;
const Label = styled.div`
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes[1]};
  overflow: -webkit-paged-x; /* weird thing for safari to render labels outside width */
  ${mediaVerySmall} {
    font-size: ${({ theme }) => theme.fontSizes[0]};
  }
  ${mediaLarge} {
    font-size: ${({ theme }) => theme.fontSizes[2]};
  }
`;

const NavItem = ({ selected, onClick, children }) => (
  <NavButton selected={selected} onClick={onClick}>
    <Circle />
    <Label>{children}</Label>
  </NavButton>
);

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
      <NavItem
        onClick={() => handleNavigation(dashboardTabs.NOW)}
        selected={currentTab === dashboardTabs.NOW}
      >
        Now
      </NavItem>
      <NavItem
        onClick={() => handleNavigation(dashboardTabs.NEXT)}
        selected={currentTab === dashboardTabs.NEXT}
      >
        Next
      </NavItem>
      <NewTaskButtonContainer>
        <NewTaskButton onClick={() => history.push(NEW_TASK)}>
          <PlusIcon size="fill" title="New Task" />
        </NewTaskButton>
      </NewTaskButtonContainer>
      <NavItem
        onClick={() => handleNavigation(dashboardTabs.SCHEDULED)}
        selected={currentTab === dashboardTabs.SCHEDULED}
      >
        Scheduled
      </NavItem>
      <NavItem
        onClick={() => handleNavigation(dashboardTabs.BLOCKED)}
        selected={currentTab === dashboardTabs.BLOCKED}
      >
        Blocked
      </NavItem>
    </FooterContainer>
  );
};

export default withRouter(FooterNavigation);
