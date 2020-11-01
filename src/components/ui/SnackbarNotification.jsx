import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import Alert from '@material-ui/lab/Alert';
import { Snackbar, makeStyles, Box, Button } from '@material-ui/core';
import { resetSnackbar } from '../../modules/dashboard';

const useStyles = makeStyles((theme) => ({
  xsPosition: {
    [theme.breakpoints.down('xs')]: {
      bottom: '2.5rem',
    },
  },
  alertMessage: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
}));

const SnackbarNotification = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const { open, message, buttonText, buttonAction, buttonLink } = props;
  const capitalButtonText = buttonText.charAt(0).toUpperCase() + buttonText.slice(1);

  if (open) {
    setTimeout(() => {
      dispatch(resetSnackbar());
    }, 5000);
  }

  const handleButtonActionClick = (event) => {
    event.stopPropagation();
    if (buttonAction) {
      buttonAction();
    }
    setTimeout(() => {
      dispatch(resetSnackbar());
    }, 200);
  };

  return (
    <Snackbar className={classes.xsPosition} open={open}>
      <Alert
        icon={false}
        severity="info"
        variant="filled"
        classes={{ message: classes.alertMessage }}
        onClick={() => dispatch(resetSnackbar())} // Tapping on the alert will close it
        action={
          (buttonLink || buttonAction) && (
            <Box display="flex" flexDirection="row" m={1}>
              <Button
                color="inherit"
                variant="outlined"
                size="small"
                {...(buttonLink
                  ? {
                      component: Link,
                      to: buttonLink,
                    }
                  : {})}
                onClick={handleButtonActionClick}
              >
                {capitalButtonText}
              </Button>
            </Box>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

SnackbarNotification.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  buttonAction: PropTypes.func,
  buttonLink: PropTypes.string,
};

SnackbarNotification.defaultProps = {
  buttonText: '',
  buttonAction: null,
  buttonLink: null,
};

export default SnackbarNotification;
