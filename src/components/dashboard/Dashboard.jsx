import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';
import invert from 'lodash/invert';

import Backdrop from '@material-ui/core/Backdrop';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { makeStyles } from '@material-ui/core/styles';

import NavigationSidebar from './navigation-sidebar/NavigationSidebar';
import TaskList from './tasks/TaskList';
import CompletedTaskList from './tasks/CompletedTaskList';
import TaskDialog from './taskForm/TaskDialog';
import DashboardAppBar, { getTopBarHeight } from './navigation-app-bar/DashboardAppBar';
import DashboardViewBar, { SECTION_TITLES_BY_TAB } from './DashboardViewBar';
import AccountSettings from './account/AccountSettings';
import CalendarDashboardRouting from './dashboard-calendar/CalendarDashboardRouting';
import Calendars from './calendars/Calendars';

import { useNotification } from '../Notification';
import {
  listenToDashboardTasks,
  setDashboardActiveTab,
  selectDashboardActiveTab,
  selectIsDataInSync,
  selectDashboadIsLoaded,
} from '../../modules/dashboard';
import { selectTaskDashboardTab } from '../../modules/tasks';
import { listenToCalendarsList } from '../../modules/calendars';
import { listenToUserExternalConfig } from '../../modules/userExternalConfig';
import { PATHS_TO_DASHBOARD_TABS } from '../../constants/paths';
import * as dashboardTabs from '../../constants/dashboardTabs';
import usePrevious from '../hooks/usePrevious';
import useLocalStorage from '../hooks/useLocalStorage';
import useMobileViewportSize from '../hooks/useMobileViewportSize';
import DashboardDragDropContext from './DashboardDragDropContext';
import DesktopNotificationsListener from './notifications/DesktopNotificationsListener';
import CalendarEventsFetcher from './CalendarEventsFetcher';

const DASHBOARD_TABS_TO_PATHS = invert(PATHS_TO_DASHBOARD_TABS);

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '100%',
  },
  placeholderToolbar: {
    minHeight: getTopBarHeight(theme),
  },
  appContentContainer: {
    flexGrow: 1,
    height: '100%',
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
  calendarAndListContainer: {
    // some css here, other in the Box attributes
    display: 'flex',
    justifyContent: 'stretch',
    flexGrow: 1,
    height: '100%',
    overflow: 'hidden', // needed for Safari iOS (iPad)
  },
  navigationBackdrop: {
    zIndex: theme.zIndex.drawer - 1,
  },
  xsPosition: {
    [theme.breakpoints.down('xs')]: {
      bottom: 120,
    },
  },
  calendarDesktopViewContainer: {
    borderLeft: `solid 1px ${theme.palette.divider}`,
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
  const mobileViewportSize = useMobileViewportSize();

  const dispatch = useDispatch();
  const activeTab = useSelector(selectDashboardActiveTab);

  const isDataInSync = useSelector(selectIsDataInSync);

  const [navigationOpen, setNavigationOpen] = useLocalStorage(
    'navigationOpen',
    !mobileViewportSize,
  );

  // Close drawer when route changes
  const previousPathname = usePrevious(location.pathname);
  useEffect(() => {
    if (
      mobileViewportSize &&
      navigationOpen &&
      previousPathname &&
      location.pathname !== previousPathname
    ) {
      setNavigationOpen(false);
    }
  }, [location.pathname, navigationOpen, previousPathname, mobileViewportSize, setNavigationOpen]);

  // Prevent user from closing if there are unsaved changes
  useEffect(() => {
    window.onbeforeunload = !isDataInSync ? confirmBeforeLeaving : () => undefined;
  }, [isDataInSync]);

  // Keeping in sync activeTab
  useEffect(() => {
    const tab = PATHS_TO_DASHBOARD_TABS[location.pathname] || dashboardTabs.NOW;
    if (tab && tab !== activeTab) {
      dispatch(setDashboardActiveTab(tab));
    }
  }, [location.pathname, activeTab, dispatch]);

  // For paths like /task/:id to redirect to the appropriate tab
  const { notifyError } = useNotification();
  const history = useHistory();
  const { taskIdFromPath } = useParams();
  const pathTaskDashboardTab = useSelector((state) =>
    taskIdFromPath ? selectTaskDashboardTab(state, taskIdFromPath) : undefined,
  );
  const dashboardLoaded = useSelector(selectDashboadIsLoaded);
  useEffect(() => {
    if (!dashboardLoaded || !taskIdFromPath) {
      return;
    }
    if (pathTaskDashboardTab && DASHBOARD_TABS_TO_PATHS[pathTaskDashboardTab]) {
      const updatedSearch = new URLSearchParams(history.location.search);
      updatedSearch.set('tid', taskIdFromPath);
      history.replace({
        pathname: DASHBOARD_TABS_TO_PATHS[pathTaskDashboardTab],
        search: updatedSearch.toString(),
      });
    } else {
      notifyError('Not found');
      history.push(DASHBOARD_TABS_TO_PATHS[dashboardTabs.NOW]);
    }
  }, [taskIdFromPath, pathTaskDashboardTab, dashboardLoaded, history, dispatch, notifyError]);

  // Snapshot listeners
  useEffect(() => dispatch(listenToDashboardTasks()), [dispatch]);
  useEffect(() => dispatch(listenToCalendarsList()), [dispatch]);
  useEffect(() => dispatch(listenToUserExternalConfig()), [dispatch]);

  const [selectedMobileTab, setSelectedMobileTab] = useState(0);

  const tabIsTaskListView = [
    dashboardTabs.NOW,
    dashboardTabs.BACKLOG,
    dashboardTabs.SCHEDULED,
    dashboardTabs.BLOCKED,
  ].includes(activeTab);

  return (
    <div className={classes.root}>
      <DesktopNotificationsListener />

      <CalendarEventsFetcher date={Date.now()} />

      <DashboardAppBar setNavigationOpen={setNavigationOpen} navigationOpen={navigationOpen} />

      <NavigationSidebar open={navigationOpen} setNavigationOpen={setNavigationOpen} />

      <div className={classes.appContentContainer}>
        <Backdrop
          open={mobileViewportSize && navigationOpen}
          className={classes.navigationBackdrop}
          onClick={() => setNavigationOpen(false)}
        />

        <DashboardDragDropContext>
          <Paper className={classes.appContent} square>
            {!tabIsTaskListView && (
              <>
                <Toolbar className={classes.placeholderToolbar} />
                <DashboardViewBar />
              </>
            )}
            {cond([
              [
                () => tabIsTaskListView && !mobileViewportSize,
                () => (
                  <Box className={classes.calendarAndListContainer}>
                    <Box width="50%" display="flex" flexDirection="column">
                      <Toolbar className={classes.placeholderToolbar} />
                      <DashboardViewBar />
                      <TaskList />
                    </Box>
                    <Box
                      width="50%"
                      display="flex"
                      flexDirection="column"
                      className={classes.calendarDesktopViewContainer}
                    >
                      <Toolbar className={classes.placeholderToolbar} />
                      <CalendarDashboardRouting />
                    </Box>
                  </Box>
                ),
              ],
              [
                () => tabIsTaskListView && mobileViewportSize,
                () => (
                  <Box
                    className={classes.calendarAndListContainer}
                    flexDirection="column"
                    alignItems="stretch"
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
                        label={SECTION_TITLES_BY_TAB[activeTab] || ''}
                        id="tab-task-list"
                        aria-controls="scrollable-auto-tabpanel-task-list"
                      />
                      <Tab
                        label="Calendar"
                        id="tab-calendar"
                        aria-controls="scrollable-auto-tabpanel-calendar"
                      />
                    </Tabs>
                    <div
                      role="tabpanel"
                      id="scrollable-auto-tabpanel-task-list"
                      aria-labelledby="tab-task-list"
                      hidden={selectedMobileTab !== 0}
                      className={selectedMobileTab !== 0 ? '' : classes.mobileTabPanel}
                    >
                      <TaskList />
                    </div>
                    <div
                      role="tabpanel"
                      id="scrollable-auto-tabpanel-calendar"
                      aria-labelledby="tab-calendar"
                      hidden={selectedMobileTab !== 1}
                      className={selectedMobileTab !== 1 ? '' : classes.mobileTabPanel}
                    >
                      <CalendarDashboardRouting />
                    </div>
                  </Box>
                ),
              ],
              [(tab) => tab === dashboardTabs.COMPLETED, () => <CompletedTaskList />],
              [(tab) => tab === dashboardTabs.ACCOUNT_SETTINGS, () => <AccountSettings />],
              [(tab) => tab === dashboardTabs.CALENDARS, () => <Calendars />],
            ])(activeTab)}
          </Paper>
        </DashboardDragDropContext>

        <TaskDialog />
      </div>
    </div>
  );
};

export default Dashboard;
