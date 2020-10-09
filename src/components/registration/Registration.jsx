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
import Box from '@material-ui/core/Box';
import Fade from '@material-ui/core/Fade';
import Grow from '@material-ui/core/Grow';
import { makeStyles } from '@material-ui/core/styles';

import { useNotification } from '../Notification';
import { getAuth } from '../../firebase';
import * as paths from '../../constants/paths';
import { selectRegistrationEmail, setRegistrationEmail } from '../../modules/registration';

export const LOG_IN = 'logIn';
export const SIGN_UP = 'signUp';
export const RECOVER_PASSWORD = 'recoverPassword';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  },
  paper: {
    width: '500px',
    maxWidth: '100%',
    padding: theme.spacing(5),
  },
  appName: {
    color: theme.palette.common.white,
    opacity: 0.8,
    marginBottom: theme.spacing(7),
  },
  viewName: {
    color: theme.palette.common.white,
    marginBottom: theme.spacing(5),
  },
}));

const ERROR_USER_NOT_FOUND = 'auth/user-not-found';
const ERROR_BAD_PASSWORD = 'auth/wrong-password';
const ERROR_INVALID_EMAIL = 'auth/invalid-email';
const ERROR_WEAK_PASSWORD = 'auth/weak-password';
const ERROR_EMAIL_IN_USE = 'auth/email-already-in-use';
const ERROR_MESSAGE_BY_CODE = {
  [ERROR_USER_NOT_FOUND]: 'User not found',
  [ERROR_BAD_PASSWORD]: 'Wrong password',
  [ERROR_INVALID_EMAIL]: 'El campo de email es incorrecto, ¿lo has escrito correctamente?',
  [ERROR_WEAK_PASSWORD]:
    'La contraseña es demasiado débil, prueba con minúculas, mayúsculas y números',
  [ERROR_EMAIL_IN_USE]: 'El email introducido ya está en uso',
};

const Registration = ({ mode }) => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const emailAddress = useSelector(selectRegistrationEmail);

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { notifyError, notifySuccess } = useNotification();

  useEffect(() => {
    setPassword('');
  }, [mode]);

  const handleLogIn = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    getAuth().signInWithEmailAndPassword(emailAddress, password)
      .then(() => {
        dispatch(setRegistrationEmail(''));
        history.push(paths.DASHBOARD);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        setSubmitting(false);
        notifyError(ERROR_MESSAGE_BY_CODE[error.code] || 'Ha ocurrido un error');
      });
  };

  const handleSignUp = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    getAuth().createUserWithEmailAndPassword(emailAddress, password)
      .then(() => {
        dispatch(setRegistrationEmail(''));
        history.push(paths.DASHBOARD);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        setSubmitting(false);
        const errorMessage = ERROR_MESSAGE_BY_CODE[error.code] || 'Ha ocurrido un error';
        notifyError(errorMessage);
      });
  };

  const handleRecoverPassword = (event) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    setSubmitting(true);
    getAuth()
      .sendPasswordResetEmail(emailAddress, { url: `${window.location.origin}/login` })
      .then(() => {
        notifySuccess('Password recovery email sent');
        setSubmitting(false);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        const errorMessage = ERROR_MESSAGE_BY_CODE[error.code] || 'Ha ocurrido un error';
        notifyError(errorMessage);
        setSubmitting(false);
      });
  };

  return (
    <div className={classes.container}>
      <Typography variant="h2" component="h1" className={classes.appName}>Quatro</Typography>
      <Fade in>
        <Typography variant="h4" component="h2" className={classes.viewName}>
          {{
          [LOG_IN]: 'Log in',
          [SIGN_UP]: 'Sign up',
          [RECOVER_PASSWORD]: 'Recover password',
        }[mode]}
        </Typography>
      </Fade>

      <Grow in>
        <Paper className={classes.paper}>
          <form onSubmit={{
            [LOG_IN]: handleLogIn,
            [SIGN_UP]: handleSignUp,
            [RECOVER_PASSWORD]: handleRecoverPassword,
          }[mode]}
          >
            <TextField
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
                startIcon={
                  submitting ? <CircularProgress thickness={8} size="1rem" color="inherit" /> : null
                }
              >
                {{
              [LOG_IN]: 'Log in',
              [SIGN_UP]: 'Sign up',
              [RECOVER_PASSWORD]: 'Recover',
            }[mode]}
              </Button>
            </Box>

            <Box mt={4} display="flex" flexDirection="column">
              {mode === LOG_IN && (
                <Typography align="center">
                  {"Don't have an account yet? "}
                  <MuiLink component={RouterLink} to={paths.SIGN_UP}>Sign up</MuiLink>
                </Typography>
              )}
              {mode === LOG_IN && (
                <Typography align="center">
                  {"Forgot password? "}
                  <MuiLink component={RouterLink} to={paths.RECOVER_PASSWORD}>Recover</MuiLink>
                </Typography>
              )}
              {mode === SIGN_UP && (
                <Typography align="center">
                  {"Already have an account? "}
                  <MuiLink component={RouterLink} to={paths.LOG_IN}>Log in</MuiLink>
                </Typography>
              )}
              {mode === RECOVER_PASSWORD && (
                <Typography align="center">
                  {"Go back to "}
                  <MuiLink component={RouterLink} to={paths.LOG_IN}>log in</MuiLink>
                </Typography>
              )}
            </Box>
          </form>
        </Paper>
      </Grow>
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