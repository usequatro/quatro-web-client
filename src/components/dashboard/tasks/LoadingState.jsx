import React from 'react';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  loadingStateContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const LoadingState = () => {
  const classes = useStyles();
  return (
    <Box className={classes.loadingStateContainer}>
      <CircularProgress color="primary" size={60} />
    </Box>
  );
};

export default LoadingState;
