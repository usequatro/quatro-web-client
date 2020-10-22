import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { Snackbar, makeStyles, Box, Button } from '@material-ui/core';
import { resetSnackbar } from '../../modules/dashboard';

const useStyles = makeStyles((theme) => ({
  xsPosition: {
    [theme.breakpoints.down('xs')]: {
      bottom: 120,
    },
  },
  snackbarStyle: {
    background: theme.palette.background.secondary,
    borderRadius: 30,
    color: 'white',
  },
  customButton: {
    borderRadius: 30,
    borderColor: '#ffff',
    color: '#ffff',
  },
}));


const SnackbarNotification = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const { open, message, buttonText, buttonAction, buttonLink } = props;
  const capitalButtonText = buttonText.charAt(0).toUpperCase() + buttonText.slice(1);
  let actionContent = null;

  if (buttonLink) {
    actionContent = (
      <Box display="flex" flexDirection="row" m={1}>
        <Button
          active="true"
          component={Link}
          to={buttonLink}
          variant="outlined"
          classes={{
            root: classes.customButton,
          }}
        >     
          {capitalButtonText}
        </Button>
      </Box>
    )
  };

  if (buttonAction) {
    actionContent = (
      <Box display="flex" flexDirection="row" m={1}>
        <Button
          size="small"
          onClick={() => {
            buttonAction()
            setTimeout(() => {
              dispatch(resetSnackbar());
            }, 200);
          }}
          variant="outlined"
          classes={{
            root: classes.customButton,
          }}
        >
          {capitalButtonText}
        </Button>
      </Box>
    )
  }

  return (
    <Snackbar
      className={classes.xsPosition}
      ContentProps={{
        className: classes.snackbarStyle
      }}
      open={open}
      message={message}
      action={actionContent}
    />
  )
}

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
}

export default SnackbarNotification;