import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import HorizontalSplitRoundedIcon from '@material-ui/icons/HorizontalSplitRounded';
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import CalendarTodayRoundedIcon from '@material-ui/icons/CalendarTodayRounded';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import DoneAllRoundedIcon from '@material-ui/icons/DoneAllRounded';
import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

import { getAuth } from '../../../firebase';
import * as tabs from '../../../constants/dashboardTabs';
import * as paths from '../../../constants/paths';
import { selectDashboardActiveTab } from '../../../modules/dashboard';
import { selectUnsavedChangesIsStatus, SAVING, ERROR } from '../../../modules/unsavedChanges';
import { selectUserPhotoURL } from '../../../modules/session';
import QuatroLogo from '../../icons/QuatroLogo';
import { CLOSED_DRAWER_WIDTH } from './NavigationSidebar';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: theme.palette.background.default,
  },
  appBarToolbar: {
    display: 'flex',
  },
  appBarCenter: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
  },
  appBarEdge: {
    width: '6rem',
    [theme.breakpoints.up('sm')]: {
      width: '10rem',
    },
    display: 'flex',
    alignItems: 'center',
  },
  sectionTitleIcon: {
    marginRight: theme.spacing(1),
  },
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
  saveLoader: {
    color: theme.palette.common.white,
  },
  accountMenuButton: {
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundColor: (props) => (props.userPhotoURL ? theme.palette.common.white : 'transparent'),
    backgroundImage: (props) => (props.userPhotoURL ? `url("${props.userPhotoURL}")` : 'none'),
    border: (props) =>
      props.userPhotoURL ? `solid 1px ${theme.palette.background.secondary}` : 'none',
  },
  navigationButton: {
    transition: ({ navigationOpen }) =>
      theme.transitions.create('transform', {
        easing: theme.transitions.easing.sharp,
        duration: navigationOpen
          ? theme.transitions.duration.enteringScreen
          : theme.transitions.duration.leavingScreen,
      }),
    transform: ({ navigationOpen }) => (navigationOpen ? 'rotate(-90deg)' : 'rotate(0deg)'),
  },
}));

const sectionTitlesByPath = {
  [tabs.NOW]: 'Top 4',
  [tabs.BACKLOG]: 'Backlog',
  [tabs.BLOCKED]: 'Blocked',
  [tabs.SCHEDULED]: 'Scheduled',
  [tabs.COMPLETED]: 'Completed',
  [tabs.ACCOUNT_SETTINGS]: 'Account',
};
const iconsByPath = {
  [tabs.NOW]: HomeRoundedIcon,
  [tabs.BACKLOG]: HorizontalSplitRoundedIcon,
  [tabs.BLOCKED]: BlockRoundedIcon,
  [tabs.SCHEDULED]: CalendarTodayRoundedIcon,
  [tabs.COMPLETED]: DoneAllRoundedIcon,
  [tabs.ACCOUNT_SETTINGS]: SettingsRoundedIcon,
};

const Dashboard = ({ setNavigationOpen, navigationOpen }) => {
  const tab = useSelector(selectDashboardActiveTab);
  const userPhotoURL = useSelector(selectUserPhotoURL);
  const status = useSelector(selectUnsavedChangesIsStatus);

  const sectionTitle = sectionTitlesByPath[tab] || 'Not found';
  const Icon = iconsByPath[tab] || Fragment;

  const classes = useStyles({ userPhotoURL, navigationOpen });

  const accountMenuAnchor = useRef();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <>
      <AppBar position="fixed" color="transparent" className={classes.appBar} elevation={2}>
        <Toolbar className={classes.appBarToolbar}>
          <Box className={classes.appBarEdge} justifyContent="flex-start">
            <IconButton
              edge="start"
              aria-label="navigation"
              onClick={() => setNavigationOpen(!navigationOpen)}
              className={classes.navigationButton}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>

          <div className={classes.appBarCenter}>
            <QuatroLogo />
          </div>

          <Box className={classes.appBarEdge} justifyContent="flex-end">
            {status === SAVING && (
              <Box flexGrow={1} display="flex" justifyContent="flex-end" pr={2}>
                <Tooltip title="Saving...">
                  <CircularProgress thickness={3} size="2rem" className={classes.saveLoader} />
                </Tooltip>
              </Box>
            )}
            {status === ERROR && (
              <Box flexGrow={1} display="flex" justifyContent="flex-end" pr={2}>
                <Tooltip title="Error saving changes">
                  <ErrorRoundedIcon color="error" fontSize="large" />
                </Tooltip>
              </Box>
            )}

            <IconButton
              edge="end"
              aria-label="account menu"
              onClick={() => setAccountMenuOpen(true)}
              className={classes.accountMenuButton}
              ref={accountMenuAnchor}
              aria-controls="account-menu"
              aria-haspopup="true"
            >
              <AccountCircleRoundedIcon style={{ opacity: userPhotoURL ? 0 : 1 }} />
            </IconButton>

            <Menu
              id="account-menu"
              anchorEl={accountMenuAnchor.current}
              keepMounted
              open={accountMenuOpen}
              onClose={() => setAccountMenuOpen(false)}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => setAccountMenuOpen(false)}
                component={Link}
                to={paths.ACCOUNT_SETTINGS}
              >
                Account
              </MenuItem>
              <MenuItem
                onClick={() => {
                  getAuth().signOut();
                  window.location.reload();
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <AppBar position="fixed" color="inherit" className={classes.sectionTitleAppBar} elevation={0}>
        <Toolbar />
        <Toolbar className={classes.sectionTitleAppBarToolbar}>
          <Icon className={classes.sectionTitleIcon} />
          <Typography variant="h5" component="h2">
            {sectionTitle}
          </Typography>
        </Toolbar>
      </AppBar>
    </>
  );
};

Dashboard.propTypes = {
  setNavigationOpen: PropTypes.func.isRequired,
  navigationOpen: PropTypes.bool.isRequired,
};

export default Dashboard;
