import React from 'react';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  circularProgress: {
    color: theme.palette.common.white,
  },
}));

const FullScreenLoader = () => {
  const classes = useStyles();
  return (
    <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
      <CircularProgress className={classes.circularProgress} size={60} />
    </Box>
  );
};

export default FullScreenLoader;
