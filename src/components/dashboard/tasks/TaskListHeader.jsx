import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  main: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    borderBottom: `solid 1px ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.lightEmphasis,
  },
}));

const TaskListHeader = ({ children }) => {
  const classes = useStyles();
  return (
    <Typography variant="h5" component="h3" className={classes.main}>
      {children}
    </Typography>
  );
};

TaskListHeader.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TaskListHeader;
