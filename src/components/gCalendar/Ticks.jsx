import React from 'react';
import Box from '@material-ui/core/Box';
import { useStyles } from './sharedStyles';

const Ticks = ({hours}) => {
  const classes = useStyles();

  return (
    hours.map(tick => {
      let style = classes.tick;

      if (tick.includes(':15') || tick.includes(':45')) {
        style = classes.quarterTick
      } else if (tick.includes(':30')) {
        style = classes.halfTick;
      }

      return (
        <Box className={style} key={Math.random()}>
          <span className={classes.tickLabel}>
            {tick}
          </span>
        </Box>
      ) 
    })
  );
};

export default Ticks;