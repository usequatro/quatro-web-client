import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  background: ({ background }) => ({
    background: get(theme.palette, background, 'transparent'),
  }),
  circularProgress: {
    color: theme.palette.common.white,
  },
}));

const FullScreenLoader = ({ background }) => {
  const backgroundWithVariation =
    background.includes('.') || background === 'transparent' ? background : `${background}.main`;
  const classes = useStyles({ background: backgroundWithVariation });
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      className={classes.background}
    >
      <CircularProgress className={classes.circularProgress} size={60} />
    </Box>
  );
};

FullScreenLoader.propTypes = {
  background: PropTypes.string,
};

FullScreenLoader.defaultProps = {
  background: 'secondary.main',
};

export default FullScreenLoader;
