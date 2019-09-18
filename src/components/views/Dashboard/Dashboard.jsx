import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';

import * as paths from '../../../constants/paths';

import DashboardHeader from './DashboardHeader';
import FooterNavigation from './FooterNavigation';
import withLoadTasks from '../../hoc/withLoadTasks';
import BasicMain from '../../ui/BasicMain';
import LoaderWrapper from '../../ui/LoaderWrapper';
import NewTask from './NewTask/NewTask';
import EditTask from './EditTask';
import Now from './Lists/Now';
import Next from './Lists/Next';
import Scheduled from './Lists/Scheduled';
import Blocked from './Lists/Blocked';
import Completed from './Lists/Completed';
import safariBorderRadiusFix from '../../style-mixins/safariBorderRadiusFix';

const DashboardMain = styled(BasicMain).attrs({
  bg: 'appForeground',
})`
  border-radius: 2rem 2rem 0 0;
  ${safariBorderRadiusFix}
`;
const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
  flex-shrink: 0;
`;


const Dashboard = ({ loaded }) => (
  <FlexContainer>
    <DashboardHeader />
    <DashboardMain>
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
    </DashboardMain>
    <FooterNavigation />
  </FlexContainer>
);

export default withLoadTasks(
  Dashboard,
  'default',
);
