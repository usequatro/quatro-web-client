import React from 'react';

import { Switch, Route, Redirect } from 'react-router-dom';
import Header from './Header';
import FooterNavigation from './FooterNavigation';
import Workspace from './Workspace';
import Main from '../../ui/Main';
import Important from './Important';
import Scheduled from './Scheduled';
import Blocked from './Blocked';
import Completed from './Completed';

export default () => (
  <React.Fragment>
    <Header />
    <Main>
      <Workspace>
        <Switch>
          <Redirect exact from="/dashboard" to="/dashboard/important" />
          <Route path="/dashboard/important" component={Important} />
          <Route path="/dashboard/scheduled" component={Scheduled} />
          <Route path="/dashboard/blocked" component={Blocked} />
          <Route path="/dashboard/completed" component={Completed} />
          <Route>404</Route>
        </Switch>
      </Workspace>
    </Main>
    <FooterNavigation />
  </React.Fragment>
);
