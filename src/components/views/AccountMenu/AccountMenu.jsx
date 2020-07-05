import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Text } from 'rebass/styled-components';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import * as firebase from 'firebase/app';
import { Transition } from 'react-transition-group';

import { selectAccountMenuOpen, setAccountMenuOpen } from '../../../modules/dashboard';
import { resetReduxState } from '../../../modules/reset';
import { selectUserDisplayName, selectUserEmail } from '../../../modules/session';
import { LOG_IN, DASHBOARD } from '../../../constants/paths';
import RefreshIcon from '../../icons/RefreshIcon';
import ButtonFunctionality from '../../ui/ButtonFunction';
import keyboardOnlyOutline from '../../style-mixins/keyboardOnlyOutline';
import activeLighter from '../../style-mixins/activeLighter';
import dropShadow from '../../style-mixins/dropShadow';
import { mediaVerySmall } from '../../style-mixins/mediaQueries';
import verticalScroll from '../../style-mixins/verticalScroll';

const duration = 250;

const AccountMenuContainer = styled(Box).attrs({
  bg: 'appForeground',
})`
  position: absolute;
  top: 2rem;
  height: calc(100% - 2rem);
  left: 0;

  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-style: solid;
  border-width: 0 1px 0 0;
  border-color: ${(props) => props.theme.colors.border};
  border-radius: 0 2rem 2rem 0;
  ${verticalScroll}

  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform ${duration}ms ease;

  max-width: 30rem;
  width: 80%;
  ${mediaVerySmall} {
    width: 90%;
  }

  ${dropShadow(0.1)}

  z-index: 11;
`;
const ProfileSection = styled(Box).attrs({ p: 3 })`
  padding: 2rem 1rem 4rem 1rem;
  border-style: solid;
  border-width: 0 0 1px 0;
  border-color: ${(props) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
`;

const MenuLink = styled.button`
  outline-color: ${(props) => props.theme.colors.textHighlight};
  cursor: pointer;
  color: ${(props) => props.theme.colors.textHighlight};
  padding: 2rem 1rem;
  text-decoration: none;
  border-style: solid;
  border-width: 0 0 1px 0;
  border-color: ${(props) => props.theme.colors.border};
  background: transparent;
  font-size: inherit;
  text-align: left;
  transition: color 250ms, background-color 250ms;

  &:hover {
    background-color: ${(props) => props.theme.colors.foregroundOptionHover};
  }
  &:focus {
    z-index: 1; /* so outline appears over the item below */
  }
  ${activeLighter}
  ${(props) => keyboardOnlyOutline(props.theme.colors.textHighlight)}

  ${(props) => (!props.disabled ? '' : `
    opacity: 0.5;
    pointer-events: none;
  `)}
`;

const AccountMenuOverlay = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  flex-shrink: 0;
  opacity: 0.6;
  background-color: ${({ theme, visible }) => (visible ? theme.colors.appBackground : 'transparent')};
  cursor: pointer;
  z-index: 10;

  transition: background-color 250ms;
`;

const AccountMenu = ({ history }) => {
  const dispatch = useDispatch();
  const displayName = useSelector(selectUserDisplayName);
  const email = useSelector(selectUserEmail);
  const accountMenuOpen = useSelector(selectAccountMenuOpen);
  const [visible, setVisible] = useState(accountMenuOpen);

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
    if (accountMenuOpen) {
      setTimeout(() => setVisible(true), 20);
    }
  }, [accountMenuOpen]);

  // To close menu when router links are clicked.
  useEffect(() => {
    const unlisten = history.listen(() => {
      if (visible) {
        setVisible(false);
      }
    });
    return () => {
      if (visible) {
        setVisible(false);
      }
      unlisten();
    };
  }, [history, visible]);

  if (!accountMenuOpen) {
    return null;
  }

  return (
    <Transition
      in={visible}
      timeout={duration}
      appear
      unmountOnExit
      mountOnEnter
      onExited={() => dispatch(setAccountMenuOpen(false))}
    >
      {(state) => (
        <>
          <AccountMenuOverlay
            visible={state === 'entering' || state === 'entered'}
            onClick={() => setVisible(false)}
          />
          <AccountMenuContainer open={state === 'entering' || state === 'entered'}>
            <ProfileSection>
              <div>
                <Text mb={2}>{displayName}</Text>
                <Text>{email}</Text>
              </div>
              <div>
                <ButtonFunctionality
                  onClick={() => window.location.reload(true)}
                  variant="text"
                >
                  <RefreshIcon size="small" />
                </ButtonFunctionality>
              </div>
            </ProfileSection>
            <MenuLink onClick={() => history.push(DASHBOARD)} autoFocus>
              Tasks
            </MenuLink>
            <MenuLink disabled>
              Connected Apps (coming soon)
            </MenuLink>
            <MenuLink disabled>
              Projects (coming soon)
            </MenuLink>
            <MenuLink disabled>
              Notifications (coming soon)
            </MenuLink>
            <MenuLink onClick={() => onLogOut()}>
              Logout
            </MenuLink>
          </AccountMenuContainer>
        </>
      )}
    </Transition>
  );
};

export default withRouter(AccountMenu);
