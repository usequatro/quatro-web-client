import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

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

const DialogTitleWithClose = ({ onClose, title, TypographyProps }) => {
  const classes = useStyles();

  return (
    <DialogTitle
      disableTypography
      className={classes.dialogTitle}
      color="transparent"
      elevation={0}
    >
      {title && (
        <Typography variant="h2" {...TypographyProps} className={classes.dialogTitleTypography}>
          {title}
        </Typography>
      )}
      <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  );
};

DialogTitleWithClose.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  TypographyProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

DialogTitleWithClose.defaultProps = {
  TypographyProps: {},
};

export default DialogTitleWithClose;
