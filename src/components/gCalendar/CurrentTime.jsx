import React, { useRef, useEffect } from 'react';
import moment from 'moment';

import { useStyles } from './sharedStyles';

const CurrentTime = () => {
  const currentTimeRef = useRef();
  const classes = useStyles();

  const differenceWithEndOfDay = moment(moment().endOf('day').toISOString()).diff(moment());
  const differenceMiliSecs = moment.duration(differenceWithEndOfDay, 'milliseconds');
  const differenceDuration = Math.floor(differenceMiliSecs.asMinutes() / 15);
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

export default CurrentTime;
