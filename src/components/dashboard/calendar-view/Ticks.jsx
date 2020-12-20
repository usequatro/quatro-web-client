import React from 'react';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import format from 'date-fns/format';
import add from 'date-fns/add';
import startOfDay from 'date-fns/startOfDay';

import TICK_HEIGHT from './tickHeight';

const useStyles = makeStyles(() => ({
  tick: {
    flex: 1,
    width: '100%',
    minHeight: TICK_HEIGHT,
    borderTop: 'solid 1px #F1F1F1',
    flexShrink: 0,
  },
  hourTick: {
    borderTop: 'solid 1px #F1F1F1',
  },
  halfTick: {
    borderTop: 'solid 1px #F6F6F6',
  },
  quarterTick: {
    borderBottom: 'solid 1px #FFFFFF',
    fontSize: 0,
  },
  tickLabel: {
    color: '#AAAAAA',
    marginTop: -11,
    display: 'block',
    backgroundColor: '#ffffff',
    width: 80,
    textAlign: 'right',
    paddingRight: 10,
  },
}));

const today = startOfDay(new Date());
const items = new Array(25)
  .fill()
  .reduce(
    (acc, _, index) => [
      ...acc,
      add(today, { hours: index }),
      add(today, { hours: index, minutes: 15 }),
      add(today, { hours: index, minutes: 30 }),
      add(today, { hours: index, minutes: 45 }),
    ],
    [],
  )
  .map((date) => format(date, 'h:mm a'));
const hours = items.slice(0, items.length - 3);

const Ticks = () => {
  const classes = useStyles();

  return (
    <Box width="100%">
      {hours.map((tick) => {
        const tickClasses = [
          classes.tick,
          tick.includes(':00') && classes.hourTick,
          tick.includes(':15') && classes.quarterTick,
          tick.includes(':30') && classes.hourTick,
          tick.includes(':45') && classes.quarterTick,
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <Box className={tickClasses} key={Math.random()}>
            <span className={classes.tickLabel}>{tick}</span>
          </Box>
        );
      })}
    </Box>
  );
};

export default Ticks;
