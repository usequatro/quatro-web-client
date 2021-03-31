import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    position: 'relative',
    display: 'flex',
  },
  dialogTitleTypography: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  extraButtonsContainer: {
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(2),
    },
  },
}));

const DialogTitleWithClose = ({ onClose, title, TypographyProps, extraButtons }) => {
  const classes = useStyles();

  return (
    <DialogTitle
      disableTypography
      className={classes.dialogTitle}
      color="transparent"
      elevation={0}
    >
      {title ? (
        <Typography
          variant="h5"
          component="h2"
          {...TypographyProps}
          className={classes.dialogTitleTypography}
        >
          {title}
        </Typography>
      ) : (
        <Box flexGrow={1} />
      )}
      {extraButtons && <Box className={classes.extraButtonsContainer}>{extraButtons}</Box>}
      <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  );
};

DialogTitleWithClose.propTypes = {
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  TypographyProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  extraButtons: PropTypes.node,
};

DialogTitleWithClose.defaultProps = {
  TypographyProps: {},
  extraButtons: undefined,
};

export default DialogTitleWithClose;
