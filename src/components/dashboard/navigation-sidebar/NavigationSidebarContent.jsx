import React from 'react';
import PropTypes from 'prop-types';
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

const useStyles = makeStyles(() => ({
  listContainer: {
    flexGrow: 1,
  },
}));

const PassThrough = ({ children }) => children;

const NavigationSidebarContent = ({ open }) => {
  const classes = useStyles();
  const activeTab = useSelector(selectDashboardActiveTab);

  const TooltipWhenClosed = open ? PassThrough : Tooltip;

  return (
    <List disablePadding className={classes.listContainer}>
      <TooltipWhenClosed title="Top 4" placement="right" arrow>
        <ListItem button component={Link} to={paths.NOW} selected={activeTab === dashboardTabs.NOW}>
          <ListItemIcon>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Top 4" />
        </ListItem>
      </TooltipWhenClosed>

      <TooltipWhenClosed title="Backlog" placement="right" arrow>
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
      </TooltipWhenClosed>

      <TooltipWhenClosed title="Scheduled" placement="right" arrow>
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
      </TooltipWhenClosed>

      <TooltipWhenClosed title="Blocked" placement="right" arrow>
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
      </TooltipWhenClosed>

      <Divider />

      <TooltipWhenClosed title="Completed" placement="right" arrow>
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
      </TooltipWhenClosed>

      <TooltipWhenClosed title="Calendars" placement="right" arrow>
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
      </TooltipWhenClosed>
    </List>
  );
};

NavigationSidebarContent.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default NavigationSidebarContent;
