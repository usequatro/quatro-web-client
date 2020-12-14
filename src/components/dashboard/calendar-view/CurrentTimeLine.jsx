import React, { useRef, useEffect, useState } from 'react';
import endOfDay from 'date-fns/endOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { makeStyles } from '@material-ui/core/styles';

import tickHeight from './tickHeight';

const useStyles = makeStyles((theme) => ({
  currentTime: {
    zIndex: theme.zIndex.drawer - 2,
    position: 'relative',
    minHeight: '2px',
    width: '88%',
    alignSelf: 'flex-end',
    backgroundColor: 'tomato',
    borderRadius: 5,
  },
}));

const getCurrentMinutes = () => differenceInMinutes(endOfDay(new Date()), new Date());

const CurrentTimeLine = () => {
  const currentTimeRef = useRef();
  const classes = useStyles();

  const [minutesToEndOfDay, setMinutesToEndOfDay] = useState(getCurrentMinutes());

  const differenceDuration = Math.floor(minutesToEndOfDay / 15);
  const topDifferenceTicks = differenceDuration + 2;
  const top = -Math.abs(topDifferenceTicks * tickHeight);

  // Refresh line every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMinutesToEndOfDay(getCurrentMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentTimeRef && currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ block: 'center' });
    }
  }, [currentTimeRef]);

  return (
    <div ref={currentTimeRef} style={{ top }} className={classes.currentTime} id="currentTime" />
  );
};

export default CurrentTimeLine;
