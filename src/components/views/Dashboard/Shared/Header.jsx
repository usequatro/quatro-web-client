import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Heading, Box } from 'rebass';
import { withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import StyledRouterLink from '../../../ui/StyledRouterLink';
import * as paths from '../../../../constants/paths';
import NewTaskIcon from '../../../icons/NewTaskIcon';
import HamburgerIcon from '../../../icons/HamburgerIcon';
import { selectDashboardMenuOpen, setDashboardMenuOpen, setAccountMenuOpen } from '../../../../modules/dashboard';
import {
  getScheduledTasks, getNextTasks, getBlockedTasks,
} from '../../../../modules/tasks';
import ButtonFunction from '../../../ui/ButtonFunction';

const duration = 150;
const transitionStyles = {
  entering: { maxHeight: '100%' },
  entered: { maxHeight: '100%' },
  exiting: { maxHeight: '0' },
  exited: { maxHeight: '0' },
};

const HeaderContainer = styled(Box).attrs({
  bg: 'appForeground',
})`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
`;

const HorizontalContainer = styled(Box).attrs({
  p: 3,
})`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  width: 100%;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const arrowColor = '000000';
const DashboardTitle = styled(Heading).attrs(() => ({
  color: 'textPrimary',
}))`
  text-align: center;
  font-family: ${(props) => props.theme.fonts.headline};
  border: none;
  background-color: transparent;
  cursor: pointer;
  padding: 0 3rem;

  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${arrowColor}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'),
    linear-gradient(to bottom, #ffffff 0%,#ffffff 100%);
  background-repeat: no-repeat, repeat;
  background-position: right .7em top 65%, 0 0;
  background-size: .65em auto, 100%;

  &:hover {
    background-color: ${(props) => props.theme.colors.menuOptionHover};
  }
  &:focus {
    background-color: ${(props) => props.theme.colors.menuOptionHover};
    outline: ${(props) => props.theme.colors.textHighlight} auto 2px;
    z-index: 1;
  }
`;

const MenuContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  overflow: hidden;
  max-height: ${(props) => transitionStyles[props.state].maxHeight};
  transition: max-height ${duration}ms ease-out;
`;

const MenuOption = styled(Heading).attrs({
  as: 'button',
  type: 'button',
})`
  border: none;
  width: 100%;
  cursor: pointer;
  padding: 1rem;
  font-family: ${(props) => props.theme.fonts.headline};
  transition: background-color 50ms ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.menuOptionHover};
  }
  &:focus {
    background-color: ${(props) => props.theme.colors.menuOptionHover};
    outline: ${(props) => props.theme.colors.textHighlight} auto 2px;
    z-index: 1;
  }
`;
const MenuOptionButton = (props) => <MenuOption {...props} as="button" type="button" />;

const titles = {
  [paths.SCHEDULED]: 'Scheduled',
  [paths.BLOCKED]: 'Blocked',
  [paths.NOW]: 'Now',
  [paths.NEXT]: 'Next',
  [paths.COMPLETED]: 'Completed',
  default: '',
};

const Header = ({ location, history }) => {
  const dispatch = useDispatch();
  const open = useSelector(selectDashboardMenuOpen);
  const handleOptionSelected = (option) => {
    history.push(option);
  };

  const scheduledTasksCount = useSelector(getScheduledTasks).length;
  const blockedTasksCount = useSelector(getBlockedTasks).length;
  const nextTasksCount = useSelector(getNextTasks).length;

  useEffect(() => {
    const unlisten = history.listen(() => {
      if (open) {
        dispatch(setDashboardMenuOpen(false));
      }
    });
    return () => {
      if (open) {
        dispatch(setDashboardMenuOpen(false));
      }
      unlisten();
    };
  }, [dispatch, history, open]);

  return (
    <HeaderContainer>
      <HorizontalContainer>
        <ButtonFunction onClick={() => dispatch(setAccountMenuOpen(true))}>
          <HamburgerIcon />
        </ButtonFunction>
        <DashboardTitle
          as="button"
          type="button"
          onClick={() => dispatch(setDashboardMenuOpen(!open))}
        >
          {titles[location.pathname] || titles.default}
        </DashboardTitle>
        <StyledRouterLink to={paths.NEW_TASK}>
          <NewTaskIcon />
        </StyledRouterLink>
      </HorizontalContainer>
      <Transition in={open} timeout={duration}>
        {(state) => (
          <MenuContainer state={state}>
            <MenuOptionButton onClick={() => handleOptionSelected(paths.NOW)}>
              Now
            </MenuOptionButton>
            <MenuOptionButton onClick={() => handleOptionSelected(paths.NEXT)}>
              {`Next (${nextTasksCount})`}
            </MenuOptionButton>
            <MenuOptionButton onClick={() => handleOptionSelected(paths.SCHEDULED)}>
              {`Scheduled (${scheduledTasksCount})`}
            </MenuOptionButton>
            <MenuOptionButton onClick={() => handleOptionSelected(paths.BLOCKED)}>
              {`Blocked (${blockedTasksCount})`}
            </MenuOptionButton>
            <MenuOptionButton onClick={() => handleOptionSelected(paths.COMPLETED)}>
              Completed
            </MenuOptionButton>
          </MenuContainer>
        )}
      </Transition>
    </HeaderContainer>
  );
};

export default withRouter(Header);
