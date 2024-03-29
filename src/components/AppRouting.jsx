import React from 'react';
import { useSelector } from 'react-redux';
import { Switch, Redirect, Route } from 'react-router-dom';
import cond from 'lodash/cond';
import { useTheme } from '@material-ui/core/styles';

import {
  selectFirebaseUserIsLoggedIn,
  selectFirebaseInErrorStatus,
  selectFirebaseUserLoading,
  selectGapiUserSignedIn,
} from '../modules/session';
import * as paths from '../constants/paths';
import Dashboard from './dashboard/Dashboard';
import LoaderScreen from './ui/LoaderScreen';
import { LogIn, SignUp, RecoverPassword } from './registration/Registration';

const AppRouting = () => {
  const firebaseInErrorStatus = useSelector(selectFirebaseInErrorStatus);
  const firebaseUserLoading = useSelector(selectFirebaseUserLoading);
  const firebaseUserIsLoggedIn = useSelector(selectFirebaseUserIsLoggedIn);
  const gapiUserIsSignedIn = useSelector(selectGapiUserSignedIn);

  // Expose theme when developing on window for convenience
  const theme = useTheme();
  if (process.env.NODE_ENV === 'development') {
    window.theme = theme;
  }

  // The condition below happens normally after coming back from the Google Auth redirect
  const gapiSignedInAndFirebaseNotYet = gapiUserIsSignedIn && !firebaseUserIsLoggedIn;

  return cond([
    [
      () => firebaseInErrorStatus,
      () => (
        <LoaderScreen key="err" background="secondary.main" color="common.white" delay={Infinity} />
      ),
    ],
    [
      () => firebaseUserLoading || gapiSignedInAndFirebaseNotYet,
      () => (
        <LoaderScreen key="loading" background="secondary.main" color="common.white" delay={500} />
      ),
    ],
    [
      () => !firebaseUserIsLoggedIn,
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
      () => true,
      () => (
        <Switch>
          <Route
            path={[paths.DASHBOARD, paths.ACCOUNT_SETTINGS, paths.TASK]}
            component={Dashboard}
          />
          {/* fallback */}
          <Redirect to={paths.NOW} />
        </Switch>
      ),
    ],
  ])();
};

export default AppRouting;
