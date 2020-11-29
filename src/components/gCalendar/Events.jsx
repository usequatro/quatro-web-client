import React from 'react';
import moment from 'moment';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { useStyles, tickHeight, extraTicks, useEventBackgroundStyles } from './sharedStyles';

const Events = ({events}) => { 
  const classes = useStyles();
  const checkboxClasses = useEventBackgroundStyles();

  const uniqueEvents =  [...new Map(events.map(item =>
    [item.id, item])).values()];

  return (
    uniqueEvents.map((event, index) => {
      const data = event.items.map(eventItem => {
        if (!eventItem.start) { return null }

        // Event height based on duration
        const eventDuration = moment(eventItem.end.dateTime).diff(moment(eventItem.start.dateTime))
        const durationMiliSecs = moment.duration(eventDuration, 'milliseconds');
        const tickDuration = Math.floor(durationMiliSecs.asMinutes() / 15);
        // Event -(minus) top based on (event start - end of day) calculation
        const differenceWithEndOfDay = moment(moment().endOf('day').toISOString()).diff(moment(eventItem.start.dateTime))
        const differenceMiliSecs = moment.duration(differenceWithEndOfDay, 'milliseconds');
        const differenceDuration = Math.floor(differenceMiliSecs.asMinutes() / 15);

        return ({
          eventHeight: tickHeight * tickDuration,
          topDifferenceTicks: differenceDuration + extraTicks,
          event: eventItem,
        });
      });

      return data.map(e => {
        const color = checkboxClasses[event.color];
        const top = -Math.abs(e.topDifferenceTicks * tickHeight);
        const zIndex = events.length - index;
  
        return (
          <Box
            key={e.event.id}
            style={{ height: e.eventHeight, top, zIndex }}
            className={`${color} ${classes.eventDefaultStyle}`}
          >
            <Typography component="p" className={classes.eventName}>
              {event.name}
            </Typography>
            <Typography component="p" className={classes.eventInfo}>
            {moment(e.event.start.dateTime).format('h:mm A')}
            {' - '}
            {moment(e.event.end.dateTime).format('h:mm A')}
            </Typography>
          </Box>
        )
      })
    })
  )
};

export default Events;