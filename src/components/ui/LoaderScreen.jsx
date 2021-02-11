import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import useDelayedState from '../hooks/useDelayedState';

const useStyles = makeStyles((theme) => ({
  box: ({ background }) => ({
    background: get(theme.palette, background, 'transparent'),
  }),
  circularProgress: ({ color }) => ({
    color: get(theme.palette, color, 'secondary.main'),
  }),
}));

const addVariation = (value) =>
  value.includes('.') || value === 'transparent' || value === 'inherit' ? value : `${value}.main`;

const circularProgressPropsBySize = {
  small: { thickness: 3, size: 30 },
  medium: { thickness: 4, size: 60 },
};

const MAX_TIMOEUT_MS = 2147483647;

const LoaderScreen = ({ className, background, color, delay, size }) => {
  const backgroundWithVariation = addVariation(background);
  const colorWithVariation = addVariation(color);

  const classes = useStyles({ background: backgroundWithVariation, color: colorWithVariation });

  const validDelay = Math.min(delay, MAX_TIMOEUT_MS);
  const showLoader = useDelayedState(true, validDelay);

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexShrink={0}
      flexGrow={1}
      className={`${classes.box} ${className}`}
    >
      {showLoader && (
        <CircularProgress
          className={classes.circularProgress}
          size={circularProgressPropsBySize[size].size}
          thickness={circularProgressPropsBySize[size].thickness}
        />
      )}
    </Box>
  );
};

LoaderScreen.propTypes = {
  className: PropTypes.string,
  background: PropTypes.string,
  color: PropTypes.string,
  delay: PropTypes.number,
  size: PropTypes.oneOf(['small', 'medium']),
};

LoaderScreen.defaultProps = {
  className: '',
  background: 'transparent',
  color: 'secondary.main',
  delay: 500,
  size: 'medium',
};

export default LoaderScreen;
