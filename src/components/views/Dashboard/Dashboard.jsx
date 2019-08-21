import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';

import * as paths from '../../../constants/paths';

import Header from './Shared/Header';
import FooterNavigation from './Shared/FooterNavigation';
import withLoadTasks from '../../hoc/withLoadTasks';
import Main from '../../ui/Main';
import LoaderWrapper from '../../ui/LoaderWrapper';
import NewTask from './NewTask/NewTask';
import EditTask from './EditTask';
import Now from './Lists/Now';
import Next from './Lists/Next';
import Scheduled from './Lists/Scheduled';
import Blocked from './Lists/Blocked';
import Completed from './Lists/Completed';

import {
  selectDashboardMenuOpen, setDashboardMenuOpen, selectAccountMenuOpen, setAccountMenuOpen,
} from '../../../modules/dashboard';
import AccountMenu from './AccountMenu';

const HorizontalContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;
const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  width: 100%;
  flex-shrink: 0;
`;
const DashboardMenuOverlay = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  flex-shrink: 0;
  opacity: 0.6;
  background-color: ${(props) => props.theme.colors.appForeground};
  cursor: pointer;
`;
const AccountMenuOverlay = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  flex-shrink: 0;
  opacity: 0.6;
  background-color: ${(props) => props.theme.colors.appForeground};
  cursor: pointer;
  z-index: 100;
`;

const Dashboard = ({ loaded }) => {
  const dispatch = useDispatch();
  const accountMenuOpen = useSelector(selectAccountMenuOpen);
  const dashboardMenuOpen = useSelector(selectDashboardMenuOpen);

  return (
    <HorizontalContainer>
      <AccountMenu />
      <FlexContainer>
        {accountMenuOpen && (
          <AccountMenuOverlay onClick={() => dispatch(setAccountMenuOpen(false))} />
        )}
        <Header />
        <Main>
          <LoaderWrapper loading={!loaded}>
            {dashboardMenuOpen && (
              <DashboardMenuOverlay onClick={() => dispatch(setDashboardMenuOpen(false))} />
            )}
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
        {false && <FooterNavigation />}
      </FlexContainer>
    </HorizontalContainer>
  );
};

export default withLoadTasks(
  Dashboard,
  'default',
  undefined,
);
