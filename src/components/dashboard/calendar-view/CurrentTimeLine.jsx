import React, { useRef, useEffect } from 'react';
import endOfDay from 'date-fns/endOfDay';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { makeStyles } from '@material-ui/core/styles';

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

const CurrentTimeLine = () => {
  const currentTimeRef = useRef();
  const classes = useStyles();

  const differenceMinutes = differenceInMinutes(endOfDay(new Date()), new Date());

  const differenceDuration = Math.floor(differenceMinutes / 15);
  const topDifferenceTicks = differenceDuration + 2;
  const top = -Math.abs(topDifferenceTicks * 25);

  useEffect(() => {
    if (currentTimeRef && currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [currentTimeRef]);

  return (
    <div ref={currentTimeRef} style={{ top }} className={classes.currentTime} id="currentTime" />
  );
};

export default CurrentTimeLine;
