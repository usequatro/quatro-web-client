import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

import { selectDashboardActiveTab } from '../../../modules/dashboard';
import * as paths from '../../../constants/paths';
import * as dashboardTabs from '../../../constants/dashboardTabs';

import HomeIcon from '../../icons/HomeIcon';
import BacklogIcon from '../../icons/BacklogIcon';
import ScheduledIcon from '../../icons/ScheduledIcon';
import BlockedIcon from '../../icons/BlockedIcon';
import CompletedIcon from '../../icons/CompletedIcon';
import ConnectedIcon from '../../icons/ConnectedIcon';

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
        <Tooltip title="Top 4" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.NOW}
            selected={activeTab === dashboardTabs.NOW}
          >
            <ListItemIcon>
              <HomeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Top 4" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Backlog" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.BACKLOG}
            selected={activeTab === dashboardTabs.BACKLOG}
          >
            <ListItemIcon>
              <BacklogIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Backlog" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Scheduled" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.SCHEDULED}
            selected={activeTab === dashboardTabs.SCHEDULED}
          >
            <ListItemIcon>
              <ScheduledIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Scheduled" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Blocked" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.BLOCKED}
            selected={activeTab === dashboardTabs.BLOCKED}
          >
            <ListItemIcon>
              <BlockedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Blocked" />
          </ListItem>
        </Tooltip>

        <Divider />

        <Tooltip title="Completed" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.COMPLETED}
            selected={activeTab === dashboardTabs.COMPLETED}
          >
            <ListItemIcon>
              <CompletedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Completed" />
          </ListItem>
        </Tooltip>

        <Tooltip title="Calendars" placement="right" enterDelay={1000} arrow>
          <ListItem
            button
            component={Link}
            to={paths.CALENDARS}
            selected={activeTab === dashboardTabs.CALENDARS}
          >
            <ListItemIcon>
              <ConnectedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Calendars" />
          </ListItem>
        </Tooltip>
      </List>

      <Divider className={classes.divider} />
    </>
  );
};

export default NavigationSidebarContent;