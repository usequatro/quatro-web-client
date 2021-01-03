import React, { useEffect, useRef } from 'react';
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
  },
}));

const PlaceholderCard = ({ start, end, tickHeight, ticksPerHour }) => {
  const classes = useStyles();

  const minutesForOneTick = 60 / ticksPerHour;
  const durationInMinutes = differenceInMinutes(end, start);
  const startTimeInMinutes = differenceInMinutes(start, startOfDay(start));

  const ref = useRef();
  const firstTime = useRef(true);
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({
        block: 'center',
        // On modal opening, scroll quick. After, do it smoothly
        behavior: firstTime.current ? 'auto' : 'smooth',
      });
      firstTime.current = false;
    }
  }, [start]);

  return (
    <Card
      style={{
        height: Math.floor(tickHeight * (durationInMinutes / minutesForOneTick)),
        transform: `translateY(${Math.floor(
          tickHeight * (startTimeInMinutes / minutesForOneTick),
        )}px)`,
        zIndex: 2,
        position: 'absolute',
      }}
      className={classes.placeholder}
      elevation={0}
      ref={ref}
    />
  );
};

PlaceholderCard.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

PlaceholderCard.defaultProps = {};

export default PlaceholderCard;
