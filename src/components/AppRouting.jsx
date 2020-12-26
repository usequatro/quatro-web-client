import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Redirect, Route } from 'react-router-dom';
import cond from 'lodash/cond';

import { selectUserIsLoggedIn } from '../modules/session';
import * as paths from '../constants/paths';
import Dashboard from './dashboard/Dashboard';
import FullScreenLoader from './ui/FullScreenLoader';
import { LogIn, SignUp, RecoverPassword } from './registration/Registration';

const AppRouting = () => {
  const userIsLoggedIn = useSelector(selectUserIsLoggedIn);

  return cond([
    [() => userIsLoggedIn === null, () => <FullScreenLoader background="secondary.main" />],
    [
      () => userIsLoggedIn === false,
      () => (
        <Switch>
          <Redirect exact from="/" to={paths.SIGN_UP} />
          <Route path={paths.LOG_IN} component={LogIn} />
          <Route path={paths.SIGN_UP} component={SignUp} />
          <Route path={paths.RECOVER_PASSWORD} component={RecoverPassword} />
          {/* fallback */}
          <Redirect to={paths.SIGN_UP} />
        </Switch>
      ),
    ],
    [
      () => userIsLoggedIn === true,
      () => (
        <Switch>
          <Route path={[paths.DASHBOARD, paths.ACCOUNT_SETTINGS]} component={Dashboard} />
          {/* fallback */}
          <Redirect to={paths.NOW} />
        </Switch>
      ),
    ],
  ])();
};

export default AppRouting;
