import React from 'react';
import styled from 'styled-components';
import isElectron from 'is-electron';
import {
  BrowserRouter, MemoryRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import Div100vh from 'react-div-100vh';
import AppStylesWrapper from './AppStylesWrapper';
import SignUp from './views/SignUp';
import LogIn from './views/LogIn';
import Account from './views/Account';
import RuntimeError from './views/RuntimeError';
import Dashboard from './views/Dashboard/Dashboard';
import withUserLoggedInCondition from './hoc/withUserLoggedInCondition';
import * as paths from '../constants/paths';
import MAX_WIDTH from '../constants/maxWidth';
import Notification from './ui/Notification';

const AppBackground = styled.div`
  background-color: ${props => props.theme.colors.appBackground};
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px ${props => props.theme.colors.border};
  overflow: hidden;

  max-width: ${MAX_WIDTH}px; /* only mobile width for now */
`;

const [Router, routerProps] = isElectron()
  ? [MemoryRouter, { initialEntries: ['/'], initialIndex: 0 }]
  : [BrowserRouter, {}];

const RouteLoggedOut = withUserLoggedInCondition(false, paths.DASHBOARD)(Route);
const RouteLoggedIn = withUserLoggedInCondition(true, paths.LOG_IN)(Route);

export default () => (
  <AppStylesWrapper>
    <AppBackground>
      <RuntimeError>
        <Router {...routerProps}>
          <Div100vh style={{ width: '100%', height: '100rvh' }}>
            <Switch>
              <Redirect exact from="/" to={paths.SIGN_UP} />
              <RouteLoggedOut path={paths.SIGN_UP} component={SignUp} />
              <RouteLoggedOut path={paths.LOG_IN} component={LogIn} />
              <RouteLoggedIn path={[paths.DASHBOARD, paths.NEW_TASK]} component={Dashboard} />
              <RouteLoggedIn path={paths.ACCOUNT} component={Account} />

              {/* fallback */}
              <Redirect to={paths.SIGN_UP} />
            </Switch>
            <Notification />
          </Div100vh>
        </Router>
      </RuntimeError>
    </AppBackground>
  </AppStylesWrapper>
);
