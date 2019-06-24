import React from 'react';
import styled from 'styled-components';
import {
  BrowserRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import AppStylesWrapper from './AppStylesWrapper';
import SignUp from './views/SignUp';
import LogIn from './views/LogIn';
import Account from './views/Account';
import Dashboard from './views/Dashboard/Dashboard';
import withUserLoggedInCondition from './hoc/withUserLoggedInCondition';
import * as paths from '../constants/paths';
import MAX_WIDTH from '../constants/maxWidth';
import Notification from './ui/Notification';

const AppBackground = styled.div`
  background-color: ${props => props.theme.colors.appBackground};
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px ${props => props.theme.colors.border};
  overflow: hidden;

  max-width: ${MAX_WIDTH}px; /* only mobile width for now */
`;

const RouteLoggedOut = withUserLoggedInCondition(false, paths.DASHBOARD)(Route);
const RouteLoggedIn = withUserLoggedInCondition(true, paths.LOG_IN)(Route);

export default () => (
  <AppStylesWrapper>
    <AppBackground>
      <BrowserRouter>
        <Switch>
          <Redirect exact from="/" to={paths.SIGN_UP} />
          <RouteLoggedOut path={paths.SIGN_UP} component={SignUp} />
          <RouteLoggedOut path={paths.LOG_IN} component={LogIn} />
          <RouteLoggedIn path={[paths.DASHBOARD, paths.NEW_TASK]} component={Dashboard} />
          <RouteLoggedIn path={paths.ACCOUNT} component={Account} />
          <Route>404</Route>
        </Switch>
      </BrowserRouter>
      <Notification />
    </AppBackground>
  </AppStylesWrapper>
);
