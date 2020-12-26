import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';

import * as tabs from '../../constants/dashboardTabs';
import { selectDashboardActiveTab } from '../../modules/dashboard';
import { CLOSED_DRAWER_WIDTH } from './navigation-sidebar/NavigationSidebar';

import HomeIcon from '../icons/HomeIcon';
import BacklogIcon from '../icons/BacklogIcon';
import ScheduledIcon from '../icons/ScheduledIcon';
import BlockedIcon from '../icons/BlockedIcon';
import CompletedIcon from '../icons/CompletedIcon';
import ConnectedIcon from '../icons/ConnectedIcon';

const useStyles = makeStyles((theme) => ({
  sectionTitleAppBar: {
    display: 'flex',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    left: 0,
    right: 0,
    width: 'auto',
    borderBottom: `solid 1px ${theme.palette.divider}`,
    [theme.breakpoints.up('sm')]: {
      left: `${CLOSED_DRAWER_WIDTH}px`,
    },
  },
  sectionTitleAppBarToolbar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
}));

const sectionTitlesByPath = {
  [tabs.NOW]: 'Top 4',
  [tabs.BACKLOG]: 'Backlog',
  [tabs.BLOCKED]: 'Blocked',
  [tabs.SCHEDULED]: 'Scheduled',
  [tabs.COMPLETED]: 'Completed',
  [tabs.ACCOUNT_SETTINGS]: 'Account',
  [tabs.CALENDARS]: 'Calendars',
};
const iconsByPath = {
  [tabs.NOW]: HomeIcon,
  [tabs.BACKLOG]: BacklogIcon,
  [tabs.SCHEDULED]: ScheduledIcon,
  [tabs.BLOCKED]: BlockedIcon,
  [tabs.COMPLETED]: CompletedIcon,
  [tabs.ACCOUNT_SETTINGS]: SettingsRoundedIcon,
  [tabs.CALENDARS]: ConnectedIcon,
};

const DashboardViewBar = () => {
  const tab = useSelector(selectDashboardActiveTab);

  const sectionTitle = sectionTitlesByPath[tab] || 'Not found';
  const Icon = iconsByPath[tab] || Fragment;

  const classes = useStyles();

  return (
    <AppBar position="static" color="inherit" className={classes.sectionTitleAppBar} elevation={0}>
      <Toolbar className={classes.sectionTitleAppBarToolbar}>
        <Icon className={classes.sectionTitleIcon} />

        <Typography variant="h5" component="h2">
          {sectionTitle}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

DashboardViewBar.propTypes = {};

export default DashboardViewBar;
