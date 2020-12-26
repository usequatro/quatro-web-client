import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';

import Backdrop from '@material-ui/core/Backdrop';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import NavigationSidebar from './navigation-sidebar/NavigationSidebar';
import TaskList from './tasks/TaskList';
import CompletedTaskList from './tasks/CompletedTaskList';
import TaskDialog from './taskForm/TaskDialog';
import DashboardAppBar, { getTopBarHeight } from './navigation-app-bar/DashboardAppBar';
import DashboardViewBar from './DashboardViewBar';
import AccountSettings from './account/AccountSettings';
import CalendarDashboardView from './calendar-dashboard-view/CalendarDashboardView';
import Calendars from './calendars/Calendars';
import SnackbarNotification from '../ui/SnackbarNotification';

import {
  listenToDashboardTasks,
  setDashboardActiveTab,
  selectDashboardActiveTab,
  selectSnackbarData,
  selectIsDataInSync,
} from '../../modules/dashboard';
import { listenToCalendarsList } from '../../modules/calendars';
import { PATHS_TO_DASHBOARD_TABS } from '../../constants/paths';
import * as dashboardTabs from '../../constants/dashboardTabs';
import usePrevious from '../hooks/usePrevious';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  placeholderToolbar: {
    minHeight: getTopBarHeight(theme),
  },
  appContentContainer: {
    flexGrow: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  appContent: {
    flexGrow: 1,
    flexDirection: 'column',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  navigationBackdrop: {
    zIndex: theme.zIndex.drawer - 1,
  },
  xsPosition: {
    [theme.breakpoints.down('xs')]: {
      bottom: 120,
    },
  },
  snackbarStyle: {
    background: theme.palette.secondary.main,
    borderRadius: 30,
    color: 'white',
  },
  calendarDesktopViewContainer: {
    borderRight: `solid 1px ${theme.palette.divider}`,
  },
  mobileTabPanel: {
    flexGrow: 1,
    flexBasis: 0,
    flexShrink: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  mobileTabList: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const message = 'Changes you made may not be saved.';
const confirmBeforeLeaving = (event) => {
  if (typeof event === 'undefined') {
    event = window.event; // eslint-disable-line no-param-reassign
  }
  if (event) {
    event.returnValue = message; // eslint-disable-line no-param-reassign
  }
  return message;
};

const Dashboard = () => {
  const classes = useStyles();
  const location = useLocation();
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up('md'));

  const dispatch = useDispatch();
  const activeTab = useSelector(selectDashboardActiveTab);

  const isDataInSync = useSelector(selectIsDataInSync);

  const snackbarData = useSelector(selectSnackbarData);

  const [navigationOpen, setNavigationOpen] = useState(false);
  // Close drawer when route changes
  const previousPathname = usePrevious(location.pathname);
  useEffect(() => {
    if (navigationOpen && location.pathname !== previousPathname) {
      setNavigationOpen(false);
    }
  }, [location.pathname, navigationOpen, previousPathname]);

  useEffect(() => {
    window.onbeforeunload = !isDataInSync ? confirmBeforeLeaving : () => undefined;
  }, [isDataInSync]);

  useEffect(() => {
    const tab = PATHS_TO_DASHBOARD_TABS[location.pathname];
    if (tab && tab !== activeTab) {
      dispatch(setDashboardActiveTab(tab));
    }
  }, [location.pathname, activeTab, dispatch]);

  // Snapshot listeners
  useEffect(() => dispatch(listenToDashboardTasks()), [dispatch]);
  useEffect(() => dispatch(listenToCalendarsList()), [dispatch]);

  const [selectedMobileTab, setSelectedMobileTab] = useState(1);

  return (
    <div className={classes.root}>
      <DashboardAppBar setNavigationOpen={setNavigationOpen} navigationOpen={navigationOpen} />
      <NavigationSidebar open={navigationOpen} />

      <div className={classes.appContentContainer}>
        <Backdrop
          open={navigationOpen}
          className={classes.navigationBackdrop}
          onClick={() => setNavigationOpen(false)}
        />

        <Paper className={classes.appContent} square>
          {activeTab !== dashboardTabs.NOW && <Toolbar className={classes.placeholderToolbar} />}
          {activeTab !== dashboardTabs.NOW && <DashboardViewBar />}
          {cond([
            [
              (tab) => tab === dashboardTabs.NOW && mdUp,
              () => (
                <Box display="flex" justifyContent="stretch" flexGrow={1} height="100vh">
                  <Box
                    width="50%"
                    display="flex"
                    flexDirection="column"
                    className={classes.calendarDesktopViewContainer}
                  >
                    <Toolbar className={classes.placeholderToolbar} />
                    <CalendarDashboardView />
                  </Box>
                  <Box width="50%" display="flex" flexDirection="column">
                    <Toolbar className={classes.placeholderToolbar} />
                    <DashboardViewBar />
                    <TaskList />
                  </Box>
                </Box>
              ),
            ],
            [
              (tab) => tab === dashboardTabs.NOW && !mdUp,
              () => (
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="stretch"
                  alignItems="stretch"
                  flexGrow={1}
                  height="100vh"
                >
                  <Toolbar className={classes.placeholderToolbar} />
                  <Tabs
                    variant="fullWidth"
                    value={selectedMobileTab}
                    onChange={(_, tab) => setSelectedMobileTab(tab)}
                    aria-label="view selector"
                    className={classes.mobileTabList}
                  >
                    <Tab
                      label="Calendar"
                      id="tab-calendar"
                      aria-controls="scrollable-auto-tabpanel-calendar"
                    />
                    <Tab
                      label={activeTab}
                      id="tab-task-list"
                      aria-controls="scrollable-auto-tabpanel-task-list"
                    />
                  </Tabs>
                  <div
                    role="tabpanel"
                    id="scrollable-auto-tabpanel-task-list"
                    aria-labelledby="tab-task-list"
                    hidden={selectedMobileTab === 0}
                    className={selectedMobileTab === 0 ? '' : classes.mobileTabPanel}
                  >
                    <DashboardViewBar />
                    <TaskList />
                  </div>
                  <div
                    role="tabpanel"
                    id="scrollable-auto-tabpanel-calendar"
                    aria-labelledby="tab-calendar"
                    hidden={selectedMobileTab === 1}
                    className={selectedMobileTab === 1 ? '' : classes.mobileTabPanel}
                  >
                    <CalendarDashboardView />
                  </div>
                </Box>
              ),
            ],
            [(tab) => tab === dashboardTabs.BACKLOG, () => <TaskList />],
            [(tab) => tab === dashboardTabs.SCHEDULED, () => <TaskList />],
            [(tab) => tab === dashboardTabs.BLOCKED, () => <TaskList />],
            [(tab) => tab === dashboardTabs.COMPLETED, () => <CompletedTaskList />],
            [(tab) => tab === dashboardTabs.ACCOUNT_SETTINGS, () => <AccountSettings />],
            [(tab) => tab === dashboardTabs.CALENDARS, () => <Calendars />],
          ])(activeTab)}
        </Paper>

        <TaskDialog />
        <SnackbarNotification {...snackbarData} />
      </div>
    </div>
  );
};

export default Dashboard;
