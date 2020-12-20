import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

import HorizontalSplitRoundedIcon from '@material-ui/icons/HorizontalSplitRounded';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import DoneAllRoundedIcon from '@material-ui/icons/DoneAllRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ControlCameraRoundedIcon from '@material-ui/icons/ControlCameraRounded';

import * as tabs from '../../../constants/dashboardTabs';
import { selectDashboardActiveTab } from '../../../modules/dashboard';
import { CLOSED_DRAWER_WIDTH } from './NavigationSidebar';

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
  [tabs.NOW]: HomeRoundedIcon,
  [tabs.BACKLOG]: HorizontalSplitRoundedIcon,
  [tabs.BLOCKED]: BlockRoundedIcon,
  [tabs.SCHEDULED]: CalendarTodayRoundedIcon,
  [tabs.COMPLETED]: DoneAllRoundedIcon,
  [tabs.ACCOUNT_SETTINGS]: SettingsRoundedIcon,
  [tabs.CALENDARS]: ControlCameraRoundedIcon,
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
