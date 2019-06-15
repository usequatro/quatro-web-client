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
import NewTask from './views/NewTask';
import withUserLoggedInCondition from './hoc/withUserLoggedInCondition';
import * as paths from '../constants/paths';

const AppBackground = styled.div`
  background-color: ${props => props.theme.colors.appBackground};
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px ${props => props.theme.colors.border};

  /* mobile only for now */
  max-width: 416px;
  max-height: 736px;
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
          <RouteLoggedIn path={paths.NEW_TASK} component={NewTask} />
          <RouteLoggedIn path={paths.DASHBOARD} component={Dashboard} />
          <RouteLoggedIn path={paths.ACCOUNT} component={Account} />
          <Route>404</Route>
        </Switch>
      </BrowserRouter>
    </AppBackground>
  </AppStylesWrapper>
);
