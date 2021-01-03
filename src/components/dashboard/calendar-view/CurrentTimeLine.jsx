import React, { forwardRef, useEffect, useState } from 'react';
import endOfDay from 'date-fns/endOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import { TICK_HEIGHT, TICKS_PER_HOUR } from '../../../constants/tickConstants';

const useStyles = makeStyles((theme) => ({
  currentTime: {
    zIndex: theme.zIndex.drawer - 2,
    position: 'relative',
    minHeight: '2px',
    width: '88%',
    alignSelf: 'flex-end',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 5,
  },
}));

const minutesForOneTick = 60 / TICKS_PER_HOUR;

const getCurrentMinutes = () => differenceInMinutes(endOfDay(new Date()), new Date());

const CurrentTimeLine = (props, ref) => {
  const classes = useStyles();

  const [minutesToEndOfDay, setMinutesToEndOfDay] = useState(getCurrentMinutes());

  const differenceDuration = minutesToEndOfDay / minutesForOneTick;
  const topDifferenceTicks = differenceDuration + 1;
  const top = -Math.floor(Math.abs(topDifferenceTicks * TICK_HEIGHT));

  // Refresh line every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesToEndOfDay(getCurrentMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      ref={ref}
      style={{ top }}
      className={classes.currentTime}
      id="currentTime"
      elevation={2}
    />
  );
};

export default forwardRef(CurrentTimeLine);
