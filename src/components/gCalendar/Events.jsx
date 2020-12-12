import React from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import isPast from 'date-fns/isPast';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import endOfDay from 'date-fns/endOfDay';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { useStyles, tickHeight, extraTicks, useEventBackgroundStyles } from './sharedStyles';

const Events = ({ events }) => {
  const classes = useStyles();
  const checkboxClasses = useEventBackgroundStyles();
  const uniqueEvents = [...new Map(events.map((item) => [item.id, item])).values()];

  return uniqueEvents.map((event, index) => {
    const data =
      event.items &&
      event.items.map((eventItem) => {
        if (!eventItem.start) {
          return null;
        }

        // Event height based on duration
        const startDate = parseISO(eventItem.start.dateTime);
        const endDate = parseISO(eventItem.end.dateTime);
        const durationMinutes = differenceInMinutes(endDate, startDate);
        const tickDuration = Math.floor(durationMinutes / 15);
        // Event -(minus) top based on (event start - end of day) calculation
        const differenceMinutes = differenceInMinutes(endOfDay(new Date()), startDate);
        const differenceDuration = Math.floor(differenceMinutes / 15);

        return {
          eventHeight: tickHeight * tickDuration,
          topDifferenceTicks: differenceDuration + extraTicks,
          event: eventItem,
        };
      });

    return (
      data &&
      data.map((e) => {
        const color = checkboxClasses[event.color];
        const top = -Math.abs(e.topDifferenceTicks * tickHeight);
        const zIndex = events.length - index;

        const startDate = parseISO(e.event.start.dateTime);
        const start = format(startDate, 'h:mm a');

        const endDate = parseISO(e.event.end.dateTime);
        const end = format(endDate, 'h:mm a');

        const eventHasPassed = isPast(startDate);

        return (
          <Box
            key={e.event.id}
            style={{ height: e.eventHeight, top, zIndex }}
            className={`${color} ${classes.eventDefaultStyle} ${
              eventHasPassed && classes.eventHasPassed
            }`}
          >
            <Typography component="p" className={classes.eventName}>
              {e.event.summary}
            </Typography>
            <Typography component="p" className={classes.eventInfo}>
              {start}
              {' - '}
              {end}
            </Typography>
          </Box>
        );
      })
    );
  });
};

export default Events;
