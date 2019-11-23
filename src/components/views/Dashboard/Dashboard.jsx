import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';

import * as paths from 'constants/paths';

import withLoadTasks from 'components/hoc/withLoadTasks';
import BasicMain from 'components/ui/BasicMain';
import LoaderWrapper from 'components/ui/LoaderWrapper';
import safariBorderRadiusFix from 'components/style-mixins/safariBorderRadiusFix';
import DashboardHeader from 'components/views/Dashboard/DashboardHeader';
import FooterNavigation from 'components/views/Dashboard/FooterNavigation';
import NewTask from 'components/views/Dashboard/NewTask/NewTask';
import EditTask from 'components/views/Dashboard/EditTask';
import Now from 'components/views/Dashboard/Lists/Now';
import Next from 'components/views/Dashboard/Lists/Next';
import Scheduled from 'components/views/Dashboard/Lists/Scheduled';
import Blocked from 'components/views/Dashboard/Lists/Blocked';
import Completed from 'components/views/Dashboard/Lists/Completed';

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
