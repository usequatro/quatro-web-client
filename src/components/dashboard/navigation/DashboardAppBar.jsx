import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

import { getAuth } from '../../../firebase';
import * as paths from '../../../constants/paths';
import { selectIsDataInSync } from '../../../modules/dashboard';
import { selectUserPhotoURL } from '../../../modules/session';
import QuatroLogo from '../../icons/QuatroLogo';
import useDebouncedState from '../../hooks/useDebouncedState';

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

const DashboardAppBar = ({ setNavigationOpen, navigationOpen }) => {
  const userPhotoURL = useSelector(selectUserPhotoURL);
  const dashboardDataIsInSync = useSelector(selectIsDataInSync);
  const showSpinner = useDebouncedState(!dashboardDataIsInSync, 750) && !dashboardDataIsInSync;

  const classes = useStyles({ userPhotoURL, navigationOpen });

  const accountMenuAnchor = useRef();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
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
          {showSpinner && (
            <Box flexGrow={1} display="flex" justifyContent="flex-end" pr={2}>
              <Tooltip title="Saving...">
                <CircularProgress thickness={3} size="2rem" className={classes.saveLoader} />
              </Tooltip>
            </Box>
          )}
          {/* {dashboardHasSavingError && (
              <Box flexGrow={1} display="flex" justifyContent="flex-end" pr={2}>
                <Tooltip title="Error saving changes">
                  <ErrorRoundedIcon color="error" fontSize="large" />
                </Tooltip>
              </Box>
            )} */}

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
                window.location.reload();
              }}
            >
              Refresh
            </MenuItem>
            <MenuItem
              onClick={() => {
                getAuth().signOut();
                window.location.reload();
              }}
            >
              Log out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

DashboardAppBar.propTypes = {
  setNavigationOpen: PropTypes.func.isRequired,
  navigationOpen: PropTypes.bool.isRequired,
};

export default DashboardAppBar;
