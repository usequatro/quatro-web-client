import React, { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import endOfDay from 'date-fns/endOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import { TICK_HEIGHT, TICKS_PER_HOUR } from '../../../constants/tickConstants';
import { selectCurrentTimestamp } from '../../../modules/dashboard';

const HEIGHT = 2;

const useStyles = makeStyles((theme) => ({
  currentTime: {
    zIndex: theme.zIndex.drawer - 2,
    position: 'relative',
    minHeight: `${HEIGHT}px`,
    width: '88%',
    alignSelf: 'flex-end',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 5,
  },
}));

const minutesForOneTick = 60 / TICKS_PER_HOUR;

const CurrentTimeLine = (_, ref) => {
  const classes = useStyles();
  const currentTimestamp = useSelector(selectCurrentTimestamp);

  const minutesToEndOfDay = differenceInMinutes(endOfDay(currentTimestamp), currentTimestamp);
  const differenceDuration = minutesToEndOfDay / minutesForOneTick;
  const topDifferenceTicks = differenceDuration + 1;
  const top = -Math.floor(Math.abs(topDifferenceTicks * TICK_HEIGHT) + HEIGHT);

  return (
    <Paper
      ref={ref}
      style={{ top }}
      className={classes.currentTime}
      id="current-time-line"
      elevation={2}
    />
  );
};

export default forwardRef(CurrentTimeLine);
