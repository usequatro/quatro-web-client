import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import startOfDay from 'date-fns/startOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  '@keyframes blinker': {
    '0%': { opacity: 0.5 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.5 },
  },
  placeholder: {
    width: '100%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.active,
    outline: 'none',
    animationName: '$blinker',
    animationDuration: '3s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    position: 'absolute',
    zIndex: 2,
  },
}));

const PlaceholderCard = ({ start, end, tickHeight, ticksPerHour, onChange }) => {
  const classes = useStyles();

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(end, start);
  const startTimeInMinutes = differenceInMinutes(start, startOfDay(start));

  const height = Math.floor(tickHeight * (durationInMinutes / minutesForOneTick));
  const y = Math.floor(tickHeight * (startTimeInMinutes / minutesForOneTick));

  useEffect(() => {
    onChange({ start, end, height, y });
  }, [start, end, height, y, onChange]);

  return (
    <Card
      style={{
        height,
        transform: `translateY(${y}px)`,
      }}
      className={classes.placeholder}
      elevation={0}
    />
  );
};

PlaceholderCard.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

PlaceholderCard.defaultProps = {
  onChange: () => {},
};

export default PlaceholderCard;
