import React from 'react';
import styled from 'styled-components';
import {
  BrowserRouter, Switch, Route, Redirect,
} from 'react-router-dom';
import AppStylesWrapper from './AppStylesWrapper';
import SignUp from './views/SignUp';
import LogIn from './views/LogIn';

const AppBackground = styled.div`
  background-color: ${props => props.theme.colors.appBackground};
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default () => (
  <AppStylesWrapper>
    <AppBackground>
      <BrowserRouter>
        <Switch>
          {/* <Route exact path="/" component={Home} /> */}
          <Redirect exact from="/" to="/signup" />
          <Route path="/signup" component={SignUp} />
          <Route path="/login" component={LogIn} />
          <Route>404</Route>
        </Switch>
      </BrowserRouter>
    </AppBackground>
  </AppStylesWrapper>
);
