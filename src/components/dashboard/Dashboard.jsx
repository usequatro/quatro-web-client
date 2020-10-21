import React, { useEffect, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';

import Backdrop from '@material-ui/core/Backdrop';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import NavigationSidebar from './navigation/NavigationSidebar';
import TaskList from './tasks/TaskList';
import CompletedTaskList from './tasks/CompletedTaskList';
import TaskDialog from './taskForm/TaskDialog';
import DashboardAppBar from './navigation/DashboardAppBar';
import AccountSettings from './account/AccountSettings';
import SnackbarNotification from '../ui/SnackbarNotification';

import {
  selectDashboadReadyForInitialFetch,
  loadDashboardTasks,
  setDashboardActiveTab,
  selectDashboardActiveTab,
  selectSnackbarData,
  resetSnackbar,
} from '../../modules/dashboard';
import { selectHasUnsavedChanges, selectUnsavedChangesSaving } from '../../modules/unsavedChanges';
import { PATHS_TO_DASHBOARD_TABS } from '../../constants/paths';
import * as dashboardTabs from '../../constants/dashboardTabs';
import usePrevious from '../../utils/usePrevious';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appContentContainer: {
    flexGrow: 1,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  appContent: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
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
    background: theme.palette.background.secondary,
    borderRadius: 30,
    color: 'white',
  },
}));


const tabsShowingTaskList = [
  dashboardTabs.NOW,
  dashboardTabs.BACKLOG,
  dashboardTabs.SCHEDULED,
  dashboardTabs.BLOCKED,
];

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

  const dispatch = useDispatch();
  const dashboardReadyForInitialFetch = useSelector(selectDashboadReadyForInitialFetch);
  const activeTab = useSelector(selectDashboardActiveTab);

  const hasUnsavedChanges = useSelector(selectHasUnsavedChanges);
  const savingUnsavedChanges = useSelector(selectUnsavedChangesSaving);

  const [navigationOpen, setNavigationOpen] = useState(false);
  // Close drawer when route changes
  const previousPathname = usePrevious(location.pathname);
  useEffect(() => {
    if (navigationOpen && location.pathname !== previousPathname) {
      setNavigationOpen(false);
    }
  }, [location.pathname, navigationOpen, previousPathname]);

  // Snackbar
  const snackbarData = useSelector(selectSnackbarData);
  useEffect(() => {
    if (snackbarData.open) {
      setTimeout(() => {
        dispatch(resetSnackbar());
      }, 5000);
    }
  }, [dispatch, snackbarData]);

  useEffect(() => {
    window.onbeforeunload =
      hasUnsavedChanges || savingUnsavedChanges ? confirmBeforeLeaving : () => undefined;
  }, [hasUnsavedChanges, savingUnsavedChanges]);

  useEffect(() => {
    const tab = PATHS_TO_DASHBOARD_TABS[location.pathname];
    if (tab && tab !== activeTab) {
      dispatch(setDashboardActiveTab(tab));
    }
  }, [location.pathname, activeTab, dispatch]);

  useEffect(() => {
    if (dashboardReadyForInitialFetch) {
      dispatch(loadDashboardTasks());
    }
  }, [dashboardReadyForInitialFetch, dispatch]);

  const renderContent = useCallback(
    () =>
      cond([
        [(tab) => tabsShowingTaskList.includes(tab), () => <TaskList />],
        [(tab) => tab === dashboardTabs.COMPLETED, () => <CompletedTaskList />],
        [(tab) => tab === dashboardTabs.ACCOUNT_SETTINGS, () => <AccountSettings />],
      ])(activeTab),
    [activeTab],
  );

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
        <Toolbar />
        <Toolbar />

        <Paper className={classes.appContent} square>
          {renderContent()}
        </Paper>

        {/* uncomment for bringing back bottom nav on mobile */}
        {/* <Hidden smUp>
          <BottomToolbar />
         </Hidden>  */}

        <TaskDialog />

        <SnackbarNotification
          open={snackbarData.open}
          buttonText={snackbarData.buttonText}
          message={snackbarData.message}
          buttonAction={snackbarData.buttonAction}
        />
      </div>
    </div>
  );
};

export default Dashboard;
