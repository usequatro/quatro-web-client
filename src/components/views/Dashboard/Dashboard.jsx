import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';

import { setTasks, getLoaded } from '../../../modules/tasks';
import { tasks } from '../../../fixtures';
import * as paths from '../../../constants/paths';

import Header from './Header';
import FooterNavigation from './FooterNavigation';
import Workspace from './Workspace';
import Main from '../../ui/Main';
import Important from './Important';
import Backlog from './Backlog';
import Scheduled from './Scheduled';
import Blocked from './Blocked';
import Completed from './Completed';

const Dashboard = (props) => {
  useEffect(() => {
    if (!props.loaded) {
      props.setTasks(tasks);
    }
  });
  return (
    <React.Fragment>
      <Header />
      <Main>
        <Workspace>
          <Switch>
            <Redirect exact from={paths.DASHBOARD} to={paths.IMPORTANT} />
            <Route path={paths.IMPORTANT} component={Important} />
            <Route path={paths.BACKLOG} component={Backlog} />
            <Route path={paths.SCHEDULED} component={Scheduled} />
            <Route path={paths.BLOCKED} component={Blocked} />
            <Route path={paths.COMPLETED} component={Completed} />
            <Route>404</Route>
          </Switch>
        </Workspace>
      </Main>
      <FooterNavigation />
    </React.Fragment>
  );
};

const mapDispatchToProps = {
  setTasks,
};
const mapStateToProps = state => ({
  loaded: getLoaded(state),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
