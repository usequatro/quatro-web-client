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

const Ticks = forwardRef(({ fontSize, format, tickHeight, ticksPerHour, date }, ref) => {
  const classes = useStyles({ tickHeight });

  /** @var {string[]} */
  const ticks = useMemo(() => {
    const startOfDayDate = startOfDay(date);

    const minutesInOneTick = 60 / ticksPerHour;
    return new Array(24)
      .fill()
      .reduce(
        (acc, _, index) => [
          ...acc,
          ...Array(ticksPerHour)
            .fill(1)
            .map((__, tick) =>
              add(startOfDayDate, { hours: index, minutes: minutesInOneTick * tick }),
            ),
        ],
        [],
      )
      .concat([add(startOfDayDate, { hours: 24 })])
      .map((d) => (getMinutes(d) === 0 ? d : ''))
      .map((d) => (d ? formatDate(d, format) : ''));
  }, [ticksPerHour, format, date]);

  return (
    <Box width="100%" px={1} ref={ref}>
      {ticks.map((tick, index) => {
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
          // eslint-disable-next-line react/no-array-index-key
          <Box className={tickClasses} key={index}>
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
  // date needed bc if the day has a Dailight Savings change, it won't have the same 24 hours
  date: PropTypes.number.isRequired,
};

Ticks.defaultProps = {
  fontSize: 'inherit',
  format: 'h:mm a',
  tickHeight: 80,
  ticksPerHour: 1,
};

export default memo(Ticks);
