import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';

import * as paths from '../../../constants/paths';

import Header from './Header';
import FooterNavigation from './FooterNavigation';
import withLoadTasks from '../../hoc/withLoadTasks';
import Main from '../../ui/Main';
import LoaderWrapper from '../../ui/LoaderWrapper';
import NewTask from './NewTask/NewTask';
import EditTask from './EditTask';
import Now from './Now';
import Next from './Next';
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
      <LoaderWrapper loading={!loaded}>
        <Switch>
          <Redirect exact from={paths.DASHBOARD} to={paths.NOW} />
          <Route path={paths.NOW} component={Now} />
          <Route path={paths.NEXT} component={Next} />
          <Route path={paths.SCHEDULED} component={Scheduled} />
          <Route path={paths.BLOCKED} component={Blocked} />
          <Route path={paths.COMPLETED} component={Completed} />
          <Route path={paths.NEW_TASK} component={NewTask} />
          <Route path={paths.EDIT_TASK} component={EditTask} />
          <Route>404</Route>
        </Switch>
      </LoaderWrapper>
    </Main>
    <FooterNavigation />
  </FlexContainer>
);

export default withLoadTasks(
  Dashboard,
  'default',
  undefined,
);
