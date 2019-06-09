import React from 'react';
import styled from 'styled-components';
import {
  BrowserRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import AppStylesWrapper from './AppStylesWrapper';
import SignUp from './views/SignUp';
import LogIn from './views/LogIn';
import Dashboard from './views/Dashboard/Dashboard';
import NewTask from './views/NewTask';
import * as paths from '../constants/paths';

const AppBackground = styled.div`
  background-color: ${props => props.theme.colors.appBackground};
  min-width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default () => (
  <AppStylesWrapper>
    <AppBackground>
      <BrowserRouter>
        <Switch>
          <Redirect exact from="/" to={paths.SIGN_UP} />
          <Route path={paths.SIGN_UP} component={SignUp} />
          <Route path={paths.LOG_IN} component={LogIn} />
          <Route path={paths.NEW_TASK} component={NewTask} />
          <Route path={paths.DASHBOARD} component={Dashboard} />
          <Route>404</Route>
        </Switch>
      </BrowserRouter>
    </AppBackground>
  </AppStylesWrapper>
);
