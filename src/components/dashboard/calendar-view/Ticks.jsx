import React, { memo, useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import formatDate from 'date-fns/format';
import add from 'date-fns/add';
import startOfDay from 'date-fns/startOfDay';
import getMinutes from 'date-fns/getMinutes';

import TickLabel from './TickLabel';

const useStyles = makeStyles((theme) => ({
  tick: ({ tickHeight }) => ({
    flex: 1,
    width: '100%',
    minHeight: tickHeight,
    borderTop: `solid 1px ${theme.palette.grey['200']}`,
    flexShrink: 0,
  }),
  tickWithTime: {},
  tickWithoutTime: {
    marginLeft: theme.spacing(10),
  },
  tickLabel: {
    top: '-0.75em',
    position: 'relative',
  },
}));

const today = startOfDay(new Date());

const Ticks = forwardRef(({ fontSize, format, tickHeight, ticksPerHour }, ref) => {
  const classes = useStyles({ tickHeight });

  const ticks = useMemo(() => {
    const minutesInOneTick = 60 / ticksPerHour;
    return new Array(24)
      .fill()
      .reduce(
        (acc, _, index) => [
          ...acc,
          ...Array(ticksPerHour)
            .fill(1)
            .map((__, tick) => add(today, { hours: index, minutes: minutesInOneTick * tick })),
        ],
        [],
      )
      .concat([add(today, { hours: 24 })])
      .map((date) => (getMinutes(date) === 0 ? date : ''))
      .map((date) => (date ? formatDate(date, format) : ''));
  }, [ticksPerHour, format]);

  return (
    <Box width="100%" px={1} ref={ref}>
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
            <TickLabel className={classes.tickLabel} fontSize={fontSize}>
              {tick}
            </TickLabel>
          </Box>
        );
      })}
    </Box>
  );
});

Ticks.propTypes = {
  fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  format: PropTypes.string,
  tickHeight: PropTypes.number,
  ticksPerHour: PropTypes.number,
};

Ticks.defaultProps = {
  fontSize: 'inherit',
  format: 'h:mm a',
  tickHeight: 80,
  ticksPerHour: 1,
};

export default memo(Ticks);
