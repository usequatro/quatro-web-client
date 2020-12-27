import React, { memo } from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import format from 'date-fns/format';
import add from 'date-fns/add';
import startOfDay from 'date-fns/startOfDay';
import getMinutes from 'date-fns/getMinutes';

import TickLabel from './TickLabel';
import { TICK_HEIGHT, TICKS_PER_HOUR } from '../../../constants/tickConstants';

const useStyles = makeStyles((theme) => ({
  tick: {
    flex: 1,
    width: '100%',
    minHeight: TICK_HEIGHT,
    borderTop: `solid 1px ${theme.palette.grey['200']}`,
    flexShrink: 0,
  },
  tickWithTime: {},
  tickWithoutTime: {
    marginLeft: theme.spacing(10),
  },
  tickLabel: {
    marginTop: '-0.75em',
  },
}));

const minutesInOneTick = 60 / TICKS_PER_HOUR;

const today = startOfDay(new Date());
const ticks = new Array(24)
  .fill()
  .reduce(
    (acc, _, index) => [
      ...acc,
      ...Array(TICKS_PER_HOUR)
        .fill(1)
        .map((__, tick) => add(today, { hours: index, minutes: minutesInOneTick * tick })),
    ],
    [],
  )
  .concat([add(today, { hours: 24 })])
  .map((date) => (getMinutes(date) === 0 ? date : ''))
  .map((date) => (date ? format(date, 'h:mm a') : ''));

const Ticks = () => {
  const classes = useStyles();

  return (
    <Box width="100%" px={1}>
      {ticks.map((tick) => {
        const tickClasses = [
          classes.tick,
          tick && classes.tickWithTime,
          !tick && classes.tickWithoutTime,
          !tick && classes.tickWithoutTime,
          !tick && classes.tickWithoutTime,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <Box className={tickClasses} key={Math.random()}>
            <TickLabel className={classes.tickLabel}>{tick}</TickLabel>
          </Box>
        );
      })}
    </Box>
  );
};

export default memo(Ticks);
