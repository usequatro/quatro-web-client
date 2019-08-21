import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from 'rebass';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import * as firebase from 'firebase/app';
import { Transition } from 'react-transition-group';

import { setAccountMenuOpen, selectAccountMenuOpen } from '../../../modules/dashboard';
import { resetReduxState } from '../../../modules/reset';
import { selectUserDisplayName, selectUserEmail } from '../../../modules/session';
import { LOG_IN, DASHBOARD } from '../../../constants/paths';
import RefreshIcon from '../../icons/RefreshIcon';
import ButtonFunctionality from '../../ui/ButtonFunction';

const duration = 250;
const transitionStyles = {
  entering: { marginLeft: '0' },
  entered: { marginLeft: '0' },
  exiting: { marginLeft: '-80%' },
  exited: { marginLeft: '-80%' },
};

const AccountMenuContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 80%;
  flex-shrink: 0;
  border-style: solid;
  border-width: 0 1px 0 0;
  border-color: ${props => props.theme.colors.border};

  margin-left: ${props => transitionStyles[props.state].marginLeft};
  transition: margin-left ${duration}ms ease;
`;
const ProfileSection = styled(Box).attrs({ p: 3 })`
  padding: 2rem 1rem 4rem 1rem;
  border-style: solid;
  border-width: 0 0 1px 0;
  border-color: ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
`;

const MenuLink = styled.button`
  outline-color: ${props => props.theme.colors.textHighlight};
  cursor: pointer;
  transition: color 150ms;
  color: ${props => props.theme.colors.textHighlight};
  padding: 2rem 1rem;
  text-decoration: none;
  border-style: solid;
  border-width: 0 0 1px 0;
  border-color: ${props => props.theme.colors.border};
  background: transparent;
  font-size: inherit;
  text-align: left;

  &:active {
    color: ${props => props.theme.colors.textHighlight};
  }
  &:hover {
    color: ${props => props.theme.colors.textHighlight};
    background-color: ${props => props.theme.colors.menuOptionHover};
  }
  &:focus {
    background-color: ${props => props.theme.colors.menuOptionHover};
    outline: ${props => props.theme.colors.textHighlight} auto 2px;
    z-index: 1;
  }
`;

const AccountMenu = ({ history }) => {
  const dispatch = useDispatch();
  const open = useSelector(selectAccountMenuOpen);

  const onLogOut = () => {
    firebase.auth().signOut()
      .then(() => {
        history.push(LOG_IN);
        dispatch(resetReduxState());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    const unlisten = history.listen(() => {
      if (open) {
        dispatch(setAccountMenuOpen(false));
      }
    });
    return () => {
      if (open) {
        dispatch(setAccountMenuOpen(false));
      }
      unlisten();
    };
  }, [dispatch, history, open]);

  const displayName = useSelector(selectUserDisplayName);
  const email = useSelector(selectUserEmail);

  return (
    <Transition in={open} timeout={duration}>
      {state => (
        <AccountMenuContainer state={state}>
          {state !== 'exited' && (
            <React.Fragment>
              <ProfileSection>
                <div>
                  <p>{displayName}</p>
                  <p>{email}</p>
                </div>
                <div>
                  <ButtonFunctionality onClick={() => window.location.reload(true)}>
                    <RefreshIcon size="small" />
                  </ButtonFunctionality>
                </div>
              </ProfileSection>
              <MenuLink onClick={() => history.push(DASHBOARD)} autoFocus>
                Tasks
              </MenuLink>
              <MenuLink>
                Connected Apps
              </MenuLink>
              <MenuLink>
                Goals
              </MenuLink>
              <MenuLink>
                Notifications
              </MenuLink>
              <MenuLink onClick={() => onLogOut()}>
                Logout
              </MenuLink>
            </React.Fragment>
          )}
        </AccountMenuContainer>
      )}
    </Transition>
  );
};

export default withRouter(AccountMenu);
