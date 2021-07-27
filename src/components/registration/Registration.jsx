import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Link as RouterLink, useHistory } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import SvgIcon from '@material-ui/core/SvgIcon';
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';

import EmailRoundedIcon from '@material-ui/icons/EmailRounded';

import GoogleButton from '../ui/GoogleButton';
import { useNotification } from '../Notification';
import firebase from '../../firebase';
import { gapiGetAuthInstance } from '../../googleApi';
import * as paths from '../../constants/paths';
import { selectRegistrationEmail, setRegistrationEmail } from '../../modules/registration';
import { ReactComponent as LogoArrowsFull } from './logo-arrows-full.svg';
import createOnboardingTasks from '../../utils/createOnboardingTasks';
import { getBrowserDetectedTimeZone } from '../../utils/timeZoneUtils';
import { fetchUpdateUserExternalConfig } from '../../utils/apiClient';
import { isClientDesktop, toggleMaximizeWindow } from '../../utils/applicationClient';
import { isMacPlaform } from '../hooks/useIsMacPlatform';

export const LOG_IN = 'logIn';
export const SIGN_UP = 'signUp';
export const RECOVER_PASSWORD = 'recoverPassword';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    minHeight: '100%',
    flexDirection: 'column',
    backgroundColor: theme.palette.secondary.main,
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'center',
    },
    // @see https://docs.todesktop.com/customizing-your-app/making-a-transparent-titlebar-draggable-macos-only
    '-webkit-app-region': 'drag',
  },
  paper: {
    width: '100%',
    maxWidth: '100%',
    minHeight: '80vh',
    padding: theme.spacing(5),
    // @see https://docs.todesktop.com/customizing-your-app/making-a-transparent-titlebar-draggable-macos-only
    '-webkit-app-region': 'no-drag',
    [theme.breakpoints.up('sm')]: {
      width: '500px',
      minHeight: 0,
    },
  },
  appLogo: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    marginBottom: theme.spacing(1),
  },
  appName: {
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(7),
  },
  viewName: {
    color: theme.palette.secondary.main,
    marginBottom: theme.spacing(5),
  },
  orSeparator: {
    padding: `0 ${theme.spacing(2)}px`,
  },
  horizontalLine: {
    borderBottom: `solid 1px ${theme.palette.divider}`,
    height: 0,
    flexGrow: 1,
  },
  actionLink: {
    whiteSpace: 'nowrap',
  },
}));

const ERROR_USER_NOT_FOUND = 'auth/user-not-found';
const ERROR_BAD_PASSWORD = 'auth/wrong-password';
const ERROR_INVALID_EMAIL = 'auth/invalid-email';
const ERROR_WEAK_PASSWORD = 'auth/weak-password';
const ERROR_EMAIL_IN_USE = 'auth/email-already-in-use';
const ERROR_MESSAGE_BY_CODE = {
  [ERROR_USER_NOT_FOUND]: 'User not found',
  [ERROR_BAD_PASSWORD]: 'The password is invalid',
  [ERROR_INVALID_EMAIL]: 'Invalid email',
  [ERROR_WEAK_PASSWORD]:
    'The password security is too weak. It must be at least 6 characters. Try with lower case letters, upper case letters and numbers',
  [ERROR_EMAIL_IN_USE]: 'Email already in use',
};
const ERROR_MESSAGE_FALLBACK = 'An error happened';

const handleStoppingPropagation = (event) => {
  event.stopPropagation();
};

const handleContainerDoubleClick = () => {
  // Since on the mac desktop app we hide the native titlebar, we implement maximize behavior here
  if (isClientDesktop() && isMacPlaform()) {
    toggleMaximizeWindow();
  }
};

const Registration = ({ mode }) => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const emailAddress = useSelector(selectRegistrationEmail);

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmailPasswordSignInForm, setShowEmailPasswordSignInForm] = useState(false);

  const { notifyError, notifySuccess } = useNotification();

  useEffect(() => {
    setPassword('');
  }, [mode]);

  const redirectLoggedInUserToDashboard = () => {
    // Clear the email on the login/signup form
    if (emailAddress) {
      dispatch(setRegistrationEmail(''));
    }
    history.push(paths.DASHBOARD);
  };

  const handlePasswordLogIn = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(emailAddress, password)
      .then(() => redirectLoggedInUserToDashboard())
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        setSubmitting(false);
        notifyError(ERROR_MESSAGE_BY_CODE[error.code] || ERROR_MESSAGE_FALLBACK);
      });
  };

  const handlePasswordSignUp = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    firebase
      .auth()
      .createUserWithEmailAndPassword(emailAddress, password)
      .then((userCredential) => createOnboardingTasks(userCredential.user.uid))
      .then(() => {
        const userTimeZone = getBrowserDetectedTimeZone();
        if (userTimeZone) {
          fetchUpdateUserExternalConfig({ timeZone: userTimeZone });
        }
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        setSubmitting(false);
        const errorMessage = ERROR_MESSAGE_BY_CODE[error.code] || ERROR_MESSAGE_FALLBACK;
        notifyError(errorMessage);
      });
  };

  const handleRecoverPassword = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    firebase
      .auth()
      .sendPasswordResetEmail(emailAddress, { url: `${window.location.origin}/login` })
      .then(() => {
        notifySuccess('Password recovery email sent');
        setSubmitting(false);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        const errorMessage = ERROR_MESSAGE_BY_CODE[error.code] || ERROR_MESSAGE_FALLBACK;
        notifyError(errorMessage);
        setSubmitting(false);
      });
  };

  const [waitingForGoogle, setWaitingForGoogle] = useState(false);
  const handleSignInWithGoogle = async () => {
    if (firebase.auth().currentUser) {
      console.error("signIn isn't expected when Firebase user is already logged in"); // eslint-disable-line no-console
      notifyError(ERROR_MESSAGE_FALLBACK);
      return;
    }
    gapiGetAuthInstance()
      .then((authInstance) => {
        const clientIsDesktop = isClientDesktop();

        // On desktop client, we must sign up via redirect for it to work.
        // Leaving popup mode for the rest of cases, as it works more reliably on mobile.
        // @link https://developers.google.com/identity/sign-in/web/reference#googleauthsignin
        const result = authInstance.signIn({ ux_mode: clientIsDesktop ? 'redirect' : 'popup' });
        return result;
      })
      .then(() => {
        setWaitingForGoogle(true);
      })
      .catch((error) => {
        if (error.error === 'popup_closed_by_user') {
          console.log(error); // eslint-disable-line no-console
          return;
        }

        console.error(error); // eslint-disable-line no-console
        const errorMessage = ERROR_MESSAGE_BY_CODE[error.code] || ERROR_MESSAGE_FALLBACK;
        notifyError(errorMessage);
      });
  };

  return (
    <div className={classes.container} onDoubleClick={handleContainerDoubleClick}>
      <Paper className={classes.paper} onDoubleClick={handleStoppingPropagation}>
        <Box display="flex" alignItems="center" flexDirection="column">
          <SvgIcon
            component={LogoArrowsFull}
            viewBox="0 0 76.87 68.04"
            title="Quatro logo"
            className={classes.appLogo}
          />
          <Typography variant="h2" component="h1" className={classes.appName}>
            Quatro
          </Typography>
        </Box>
        <Fade in>
          <div>
            <Typography variant="h4" component="h2" className={classes.viewName}>
              {
                {
                  [LOG_IN]: 'Log in',
                  [SIGN_UP]: 'Sign up',
                  [RECOVER_PASSWORD]: 'Recover password',
                }[mode]
              }
            </Typography>

            {(mode === LOG_IN || mode === SIGN_UP) && (
              <Box>
                <GoogleButton
                  onClick={handleSignInWithGoogle}
                  fullWidth
                  endIcon={
                    waitingForGoogle ? (
                      <CircularProgress thickness={6} size="1rem" color="inherit" />
                    ) : null
                  }
                >
                  {
                    {
                      [LOG_IN]: 'Sign in with Google',
                      [SIGN_UP]: 'Sign up with Google',
                    }[mode]
                  }
                </GoogleButton>

                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  pt={3}
                  pb={3}
                >
                  <span className={classes.horizontalLine} />
                  <span className={classes.orSeparator}>or</span>
                  <span className={classes.horizontalLine} />
                </Box>
              </Box>
            )}

            {mode === SIGN_UP && !showEmailPasswordSignInForm && (
              <Button
                type="button"
                variant="outlined"
                size="large"
                style={{ fontWeight: 500 }}
                fullWidth
                startIcon={<EmailRoundedIcon color="action" />}
                onClick={() => setShowEmailPasswordSignInForm(true)}
              >
                Sign up with email and password
              </Button>
            )}

            {(mode !== SIGN_UP || showEmailPasswordSignInForm) && (
              <form
                onSubmit={
                  {
                    [LOG_IN]: handlePasswordLogIn,
                    [SIGN_UP]: handlePasswordSignUp,
                    [RECOVER_PASSWORD]: handleRecoverPassword,
                  }[mode]
                }
              >
                <TextField
                  autoFocus={mode === SIGN_UP}
                  label="Email address"
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  type="email"
                  value={emailAddress}
                  onChange={(event) => dispatch(setRegistrationEmail(event.target.value))}
                />

                {(mode === SIGN_UP || mode === LOG_IN) && (
                  <TextField
                    label="Password"
                    margin="normal"
                    variant="outlined"
                    fullWidth
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                )}

                <Box mt={4} display="flex" justifyContent="center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    endIcon={
                      submitting ? (
                        <CircularProgress thickness={6} size="1rem" color="inherit" />
                      ) : null
                    }
                  >
                    {
                      {
                        [LOG_IN]: 'Log in',
                        [SIGN_UP]: 'Sign up',
                        [RECOVER_PASSWORD]: 'Recover',
                      }[mode]
                    }
                  </Button>
                </Box>
              </form>
            )}

            <Box mt={4} display="flex" flexDirection="column">
              {mode === LOG_IN && (
                <Typography align="center">
                  {"Don't have an account yet? "}
                  <MuiLink component={RouterLink} to={paths.SIGN_UP} className={classes.actionLink}>
                    Sign up
                  </MuiLink>
                </Typography>
              )}
              {mode === LOG_IN && (
                <Typography align="center">
                  {'Forgot password? '}
                  <MuiLink
                    component={RouterLink}
                    to={paths.RECOVER_PASSWORD}
                    className={classes.actionLink}
                  >
                    Recover
                  </MuiLink>
                </Typography>
              )}
              {mode === SIGN_UP && (
                <Typography align="center">
                  {'Already have an account? '}
                  <MuiLink component={RouterLink} to={paths.LOG_IN} className={classes.actionLink}>
                    Log in
                  </MuiLink>
                </Typography>
              )}
              {mode === RECOVER_PASSWORD && (
                <Typography align="center">
                  {'Go back to '}
                  <MuiLink component={RouterLink} to={paths.LOG_IN} className={classes.actionLink}>
                    log in
                  </MuiLink>
                </Typography>
              )}
            </Box>
          </div>
        </Fade>
      </Paper>
    </div>
  );
};

Registration.propTypes = {
  mode: PropTypes.oneOf([LOG_IN, SIGN_UP, RECOVER_PASSWORD]).isRequired,
};

export default Registration;

export const LogIn = () => <Registration mode={LOG_IN} />;
export const SignUp = () => <Registration mode={SIGN_UP} />;
export const RecoverPassword = () => <Registration mode={RECOVER_PASSWORD} />;
