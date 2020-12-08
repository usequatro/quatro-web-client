import React from 'react';
import PropTypes from 'prop-types';

import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  dialogTitle: {
    position: 'relative',
    display: 'flex',
  },
  dialogTitleTypography: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
}));

const DialogTitleWithClose = ({ onClose, children, typographyProps, ...rest }) => {
  const classes = useStyles();
  return (
    <DialogTitle
      disableTypography
      className={classes.dialogTitle}
      color="transparent"
      elevation={0}
      {...rest}
    >
      <Typography
        variant="h6"
        component="h2"
        className={classes.dialogTitleTypography}
        {...typographyProps}
      >
        {children}
      </Typography>
      <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  );
};

DialogTitleWithClose.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  typographyProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
DialogTitleWithClose.defaultProps = {
  typographyProps: {},
};

export default DialogTitleWithClose;
