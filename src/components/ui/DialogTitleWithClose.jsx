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
    alignItems: 'center',
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

const DialogTitleWithClose = ({ onClose, iconStart, title, TypographyProps, extraButtons }) => {
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
          {iconStart && (
            <Box mr={1} component="span" aria-hidden display="flex">
              {iconStart}
            </Box>
          )}
          {title}
        </Typography>
      ) : (
        <Box flexGrow={1} />
      )}
      {extraButtons && <Box className={classes.extraButtonsContainer}>{extraButtons}</Box>}
      <IconButton edge="end" size="small" color="inherit" onClick={onClose} aria-label="close">
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
  );
};

DialogTitleWithClose.propTypes = {
  onClose: PropTypes.func.isRequired,
  iconStart: PropTypes.node,
  title: PropTypes.node.isRequired,
  TypographyProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  extraButtons: PropTypes.node,
};

DialogTitleWithClose.defaultProps = {
  TypographyProps: {},
  iconStart: undefined,
  extraButtons: undefined,
};

export default DialogTitleWithClose;
