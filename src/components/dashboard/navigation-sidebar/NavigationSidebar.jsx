import React from 'react';
import PropTypes from 'prop-types';

import Drawer from '@material-ui/core/Drawer';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';

import NavigationSidebarContent from './NavigationSidebarContent';
import NavigationSidebarFooter from './NavigationSidebarFooter';
import { getTopBarHeight } from '../navigation-app-bar/DashboardAppBar';

export const CLOSED_DRAWER_WIDTH = 54;
const OPEN_DRAWER_WIDTH = 240;

const useStyles = makeStyles((theme) => ({
  placeholderToolbar: {
    minHeight: getTopBarHeight(theme),
  },
  // this creates the space so the page contents have a padding
  drawer: {
    width: 0,
    height: 0,
    flexShrink: 0,
    [theme.breakpoints.up('sm')]: {
      width: ({ open }) => (open ? OPEN_DRAWER_WIDTH : CLOSED_DRAWER_WIDTH),
      height: '100vh',
    },
  },
  // this is the actual drawer that can go above the page contents
  drawerPaper: {
    height: '100vh',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    width: ({ open }) => (open ? OPEN_DRAWER_WIDTH : 0),
    [theme.breakpoints.up('sm')]: {
      width: ({ open }) => (open ? OPEN_DRAWER_WIDTH : CLOSED_DRAWER_WIDTH),
    },
    transition: ({ open }) =>
      theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: open
          ? theme.transitions.duration.enteringScreen
          : theme.transitions.duration.leavingScreen,
      }),
  },
}));

export default function NavigationSidebar({ open, setNavigationOpen }) {
  const classes = useStyles({ open });

  return (
    <nav className={classes.drawer} aria-label="navigation">
      <Drawer classes={{ paper: classes.drawerPaper }} variant="permanent" open>
        <Toolbar className={classes.placeholderToolbar} />
        <NavigationSidebarContent open={open} />
        <NavigationSidebarFooter open={open} setNavigationOpen={setNavigationOpen} />
      </Drawer>
    </nav>
  );
}

NavigationSidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  setNavigationOpen: PropTypes.func.isRequired,
};
