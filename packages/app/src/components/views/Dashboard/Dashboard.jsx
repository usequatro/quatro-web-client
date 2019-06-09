import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect } from 'react-router-dom';

import { setTasks } from '../../../modules/tasks';
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
    props.setTasks(tasks);
  }, [props]);
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
Dashboard.propTypes = {
  setTasks: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setTasks,
};

export default connect(null, mapDispatchToProps)(Dashboard);
