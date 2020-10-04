import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import HorizontalSplitRoundedIcon from '@material-ui/icons/HorizontalSplitRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import DoneAllRoundedIcon from '@material-ui/icons/DoneAllRounded';

import { selectDashboardActiveTab } from '../../../modules/dashboard';
import * as paths from '../../../constants/paths';
import * as dashboardTabs from '../../../constants/dashboardTabs';

const useStyles = makeStyles((theme) => ({
  divider: {
    backgroundColor: theme.palette.common.white,
  },
}));

const NavigationSidebarContent = () => {
  const classes = useStyles();
  const activeTab = useSelector(selectDashboardActiveTab);
  return (
    <>
      <List disablePadding>
        <ListItem
          button
          component={Link}
          to={paths.NOW}
          selected={activeTab === dashboardTabs.NOW}
        >
          <ListItemIcon><HomeRoundedIcon /></ListItemIcon>
          <ListItemText primary="Top 4" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={paths.BACKLOG}
          selected={activeTab === dashboardTabs.BACKLOG}
        >
          <ListItemIcon><HorizontalSplitRoundedIcon /></ListItemIcon>
          <ListItemText primary="Backlog" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={paths.SCHEDULED}
          selected={activeTab === dashboardTabs.SCHEDULED}
        >
          <ListItemIcon><CalendarTodayRoundedIcon /></ListItemIcon>
          <ListItemText primary="Scheduled" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={paths.BLOCKED}
          selected={activeTab === dashboardTabs.BLOCKED}
        >
          <ListItemIcon><BlockRoundedIcon /></ListItemIcon>
          <ListItemText primary="Blocked" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to={paths.COMPLETED}
          selected={activeTab === dashboardTabs.COMPLETED}
        >
          <ListItemIcon><DoneAllRoundedIcon /></ListItemIcon>
          <ListItemText primary="Completed" />
        </ListItem>
      </List>

      <Divider className={classes.divider} />
    </>
  );
};

export default NavigationSidebarContent;
