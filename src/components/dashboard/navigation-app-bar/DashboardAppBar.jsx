import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import Hidden from '@material-ui/core/Hidden';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiLink from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';

import MenuRoundedIcon from '@material-ui/icons/MenuRounded';

import * as paths from '../../../constants/paths';
import { selectIsDataInSync } from '../../../modules/dashboard';
import { selectUserPhotoURL } from '../../../modules/session';
import useDelayedState from '../../hooks/useDelayedState';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';
import UserIcon from '../../icons/UserIcon';
import AppLogoPlain from '../../icons/AppLogoPlain';
import {
  isDesktopClient,
  isMobileDeviceUserAgent,
  isMacPlaform,
  toggleMaximizeWindow,
} from '../../../utils/applicationClient';
import { firebaseGetAuthIdToken } from '../../../firebase';
import EmailVerificationBehavior from '../../email-verification/EmailVerificationBehavior';

const DESKTOP_CLIENT_DOWNLOAD_URL = process.env.REACT_APP_DESKTOP_CLIENT_DOWNLOAD_URL;

export const getTopBarHeight = (theme) => theme.spacing(6);

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    // @see https://docs.todesktop.com/customizing-your-app/making-a-transparent-titlebar-draggable-macos-only
    '-webkit-app-region': 'drag',
    '& button': {
      '-webkit-app-region': 'no-drag',
    },
  },
  appBarLogo: {
    height: theme.spacing(3),
    color: theme.palette.common.white,
  },
  appBarToolbar: {
    display: 'flex',
    minHeight: getTopBarHeight(theme),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  appBarButtons: {
    whiteSpace: 'nowrap',
    '&:hover': {
      backgroundColor: `${theme.palette.action.contrastHover} !important`,
    },
    '&.MuiButton-outlined': {
      marginRight: theme.spacing(1),
    },
  },
  appBarEdge: {
    width: '6rem',
    [theme.breakpoints.up('sm')]: {
      width: '10rem',
    },
    display: 'flex',
    alignItems: 'center',
  },
  appBarSpinner: {
    color: theme.palette.common.white,
  },
  accountMenuButton: {
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundColor: (props) => (props.userPhotoURL ? theme.palette.common.white : 'transparent'),
    backgroundImage: (props) => (props.userPhotoURL ? `url("${props.userPhotoURL}")` : 'none'),
    border: (props) => (props.userPhotoURL ? `solid 1px ${theme.palette.secondary.dark}` : 'none'),
  },
  navigationButton: {
    color: 'inherit',
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

const handleAppBarDoubleClick = () => {
  // Since on the mac desktop app we hide the native titlebar, we implement maximize behavior here
  if (isDesktopClient() && isMacPlaform()) {
    toggleMaximizeWindow();
  }
};

const DashboardAppBar = ({ setNavigationOpen, navigationOpen }) => {
  const userPhotoURL = useSelector(selectUserPhotoURL);
  const dashboardDataIsInSync = useSelector(selectIsDataInSync);

  // Introduce a delay before the spinner shows
  const showSpinner = useDelayedState(!dashboardDataIsInSync, 750) && !dashboardDataIsInSync;

  const classes = useStyles({ userPhotoURL, navigationOpen });

  const accountMenuAnchor = useRef();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const { signOut } = useGoogleApiSignIn();

  const handleSignOut = () => {
    setAccountMenuOpen(false);
    signOut();
  };

  // Append the user's ID token to the URL so we can track them
  const [desktopClientUrl, setDesktopClientUrl] = useState(DESKTOP_CLIENT_DOWNLOAD_URL);
  useEffect(() => {
    firebaseGetAuthIdToken().then((idToken) => {
      const authenticatedDesktopClientUrl = `${DESKTOP_CLIENT_DOWNLOAD_URL}?id_token=${idToken}`;
      setDesktopClientUrl(authenticatedDesktopClientUrl);
    });
  }, []);

  return (
    <AppBar
      position="fixed"
      color="secondary"
      className={classes.appBar}
      elevation={2}
      onDoubleClick={handleAppBarDoubleClick}
    >
      <Toolbar className={classes.appBarToolbar} disableGutters>
        <Hidden smUp>
          <Box justifyContent="flex-start">
            <IconButton
              edge="start"
              aria-label="navigation"
              onClick={() => setNavigationOpen(!navigationOpen)}
              className={classes.navigationButton}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Hidden>

        <Box display="flex" flexGrow={1} alignItems="center">
          <AppLogoPlain className={classes.appBarLogo} title="Quatro logo" />

          {process.env.REACT_APP_DEVELOPMENT && (
            <Box ml={2}>
              <Typography style={{ fontStyle: 'italic', color: 'white', opacity: 0.2 }}>
                Staging Environment
              </Typography>
            </Box>
          )}
        </Box>

        <Box className={classes.appBarEdge} justifyContent="flex-end">
          {showSpinner && (
            <Box flexGrow={1} display="flex" justifyContent="flex-end" pr={2}>
              <Tooltip title="Saving..." arrow>
                <CircularProgress thickness={3} size="1.5rem" className={classes.appBarSpinner} />
              </Tooltip>
            </Box>
          )}

          <Hidden smDown>
            <Box mx={2} display="flex" flexDirection="row">
              <EmailVerificationBehavior
                render={(onSendVerificationEmail, submittingVerification, sentVerification) => (
                  <Button
                    className={classes.appBarButtons}
                    variant="outlined"
                    color="inherit"
                    onClick={onSendVerificationEmail}
                    endIcon={
                      submittingVerification ? (
                        <CircularProgress
                          thickness={3}
                          size="1.5rem"
                          className={classes.appBarSpinner}
                        />
                      ) : null
                    }
                  >
                    {sentVerification ? 'Verification email sent' : 'Send Verification Email'}
                  </Button>
                )}
              />

              {!isDesktopClient() && !isMobileDeviceUserAgent() && (
                <Button
                  className={classes.appBarButtons}
                  variant="outlined"
                  color="inherit"
                  href={desktopClientUrl}
                  disabled={!desktopClientUrl} // defensive programming
                >
                  Download Desktop App
                </Button>
              )}
              <Button
                className={classes.appBarButtons}
                variant="text"
                color="inherit"
                href="mailto:contact@usequatro.com"
                target="_blank"
              >
                Contact us
              </Button>

              <Button
                className={classes.appBarButtons}
                variant="text"
                color="inherit"
                href="https://usequatro.com/faq"
                target="_blank"
              >
                FAQ
              </Button>
            </Box>
          </Hidden>

          <IconButton
            edge="end"
            aria-label="account menu"
            onClick={() => setAccountMenuOpen(true)}
            className={classes.accountMenuButton}
            ref={accountMenuAnchor}
            aria-controls="account-menu"
            aria-haspopup="true"
            size="small"
            color="inherit"
          >
            <UserIcon style={{ opacity: userPhotoURL ? 0 : 1 }} />
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
            <Hidden mdUp>
              <MenuItem component={MuiLink} target="_blank" href="mailto:contact@usequatro.com">
                Contact us
              </MenuItem>
              <MenuItem component={MuiLink} target="_blank" href="https://usequatro.com/faq">
                FAQ
              </MenuItem>
            </Hidden>
            <MenuItem onClick={handleSignOut}>Log out</MenuItem>
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
