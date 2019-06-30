import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';

import { getLoaded } from '../../../modules/tasks';
import * as paths from '../../../constants/paths';

import Header from './Header';
import FooterNavigation from './FooterNavigation';
import withLoadTasks from '../../hoc/withLoadTasks';
import Main from '../../ui/Main';
import Loader from '../../ui/Loader';
import NewTask from './NewTask/NewTask';
import EditTask from './EditTask';
import Important from './Important';
import Backlog from './Backlog';
import Scheduled from './Scheduled';
import Blocked from './Blocked';
import Completed from './Completed';

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
`;

const Dashboard = ({ loaded }) => (
  <FlexContainer>
    <Header />
    <Main>
      {!loaded && (
        <Loader />
      )}
      {loaded && (
        <Switch>
          <Redirect exact from={paths.DASHBOARD} to={paths.IMPORTANT} />
          <Route path={paths.IMPORTANT} component={Important} />
          <Route path={paths.BACKLOG} component={Backlog} />
          <Route path={paths.SCHEDULED} component={Scheduled} />
          <Route path={paths.BLOCKED} component={Blocked} />
          <Route path={paths.COMPLETED} component={Completed} />
          <Route path={paths.NEW_TASK} component={NewTask} />
          <Route path={paths.EDIT_TASK} component={EditTask} />
          <Route>404</Route>
        </Switch>
      )}
    </Main>
    <FooterNavigation />
  </FlexContainer>
);

const mapStateToProps = state => ({
  loaded: getLoaded(state),
});

export default withLoadTasks(connect(mapStateToProps)(Dashboard));
