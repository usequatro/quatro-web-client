import React from 'react';
import PropTypes from 'prop-types';

import { Snackbar, makeStyles, withStyles, Box, Button } from '@material-ui/core';

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
}));

const ColorButton = withStyles(() => ({
  root: {
    borderRadius: 30,
    borderColor: '#ffff',
    color: '#ffff',
  },
}))(Button);

const SnackbarNotification = (props) => {
  const classes = useStyles();
  const { open, message, buttonText, buttonAction } = props;
  let actionContent = null;

  if (buttonAction) {
    actionContent = (
      <Box display="flex" flexDirection="row" m={1}>
        <ColorButton
          size="small"
          onClick={() => {
            buttonAction()
          }}
          variant="outlined"
        >
          {buttonText}
        </ColorButton>
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
};

SnackbarNotification.defaultProps = {
  buttonText: '',
  buttonAction: null,
}

export default SnackbarNotification;