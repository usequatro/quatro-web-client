import React from 'react';
import styled from 'styled-components';
import mixpanel from 'mixpanel-browser';
import { MixpanelProvider } from 'react-mixpanel';
import {
  BrowserRouter, MemoryRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import Div100vh from 'react-div-100vh';

import * as paths from 'constants/paths';
import MAX_WIDTH from 'constants/maxWidth';

import AppStylesWrapper from 'components/AppStylesWrapper';
import RouterHistoryListener from 'components/tracking/RouterHistoryListener';
import UserLoginListener from 'components/tracking/UserLoginListener';
import Registration from 'components/views/Registration/Registration';
import RuntimeError from 'components/views/RuntimeError';
import AccountMenu from 'components/views/AccountMenu/AccountMenu';
import Dashboard from 'components/views/Dashboard/Dashboard';
import withUserLoggedInCondition from 'components/hoc/withUserLoggedInCondition';
import Notification from 'components/ui/Notification';

const AppBackground = styled.div`
  background-color: ${(props) => props.theme.colors.appBackground};
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  outline: solid 1px ${(props) => props.theme.colors.border}; /* external border to the window */
  overflow: hidden;

  max-width: ${MAX_WIDTH}; /* only mobile width for now */
`;

// In Safari, when saving the website to home.
const isAppFullScreenMode = () => ('standalone' in window.navigator) && window.navigator.standalone;

const [Router, routerProps] = isAppFullScreenMode()
  ? [MemoryRouter, { initialEntries: ['/'], initialIndex: 0 }]
  : [BrowserRouter, {}];

const RouteLoggedOut = withUserLoggedInCondition(false, paths.DASHBOARD)(Route);
const RouteLoggedIn = withUserLoggedInCondition(true, paths.LOG_IN)(Route);

// Initialize MixPanel with our Key
mixpanel.init(process.env.REACT_APP_MIXPANEL_KEY);

export default () => (
  <AppStylesWrapper>
    <AppBackground>
      <RuntimeError>
        <MixpanelProvider mixpanel={mixpanel}>
          <UserLoginListener mixpanel={mixpanel} />
          <Router {...routerProps}>
            <RouterHistoryListener />
            <Div100vh style={{ width: '100%', height: '100rvh' }}>
              <Switch>
                <Redirect exact from="/" to={paths.SIGN_UP} />
                <RouteLoggedOut path={[paths.SIGN_UP, paths.LOG_IN]} component={Registration} />
                <RouteLoggedIn
                  path={[paths.DASHBOARD, paths.NEW_TASK]}
                  render={() => (
                    <>
                      <AccountMenu />
                      <Dashboard />
                    </>
                  )}
                />

                {/* fallback */}
                <Redirect to={paths.SIGN_UP} />
              </Switch>
              <Notification />
            </Div100vh>
          </Router>
        </MixpanelProvider>
      </RuntimeError>
    </AppBackground>
  </AppStylesWrapper>
);
