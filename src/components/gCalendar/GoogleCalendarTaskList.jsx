import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { cond } from 'lodash';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch} from 'react-redux';
import { useHistory } from "react-router-dom";
import moment from 'moment';

import {
  selectGoogleConnectedCalendars,
  getEventsFromCalendars,
  selectGoogleCalendarEvents,
} from '../../modules/googleCalendar';

import { GOOGLE_CALENDAR_TASK_LIST } from '../../constants/dashboardTabs';
import EmptyState from '../dashboard/tasks/EmptyState';
import ConnectButton from './ConnectButton';

const tickHeight = 25;
const renderedTickHeight = 25;
const extraTicks = 2;

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: 230,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  tick: {
    flex: 1,
    width: '100%',
    minHeight: tickHeight,
    borderTop: 'solid 1px #F1F1F1',
  },
  halfTick: {
    flex: 1,
    borderTop: 'solid 1px #F6F6F6',
    width: '100%',
    minHeight: tickHeight,
  },
  quarterTick: {
    flex: 1,
    borderBottom: 'solid 1px #FFFFFF',
    width: '100%',
    minHeight: tickHeight,
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
  eventsContainer: {
    position: 'relative',
    width: '100%',
    display: "flex",
    justifyContent: "flex-end"
  },
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    color: '#FFFFFF',
    border: '1px solid #FFFFFF'
  },
  eventName: {
    fontWeight: 'bold',
    display: 'block',
  },
  eventInfo: {
    display: 'block',
  },
  eventDuration: {
    width: '100%',
    border: `solid 0px ${theme.palette.divider}`,
    color: '#FFFFFF',
    height: 'auto'
  },
  radioMagenta: {
    backgroundColor: '#EB40AC',
  },
  radioOrange: {
    backgroundColor: '#F08934',
  },
  radioBlackboard: {
    backgroundColor: '#3C717B',
  },
}));

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

const Events = ({events}) => {
  const classes = useStyles();
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
          eventHeight: renderedTickHeight * tickDuration,
          topDifferenceTicks: differenceDuration + extraTicks,
          event: eventItem,
        });
      });

      return data.map(e => {
        const color = classes[event.color]
        const top = -Math.abs(e.topDifferenceTicks * renderedTickHeight);
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

const CalendarTaskList = ({hours, events}) => {
  const classes = useStyles();

  return (
    <>
      <Ticks hours={hours} />
      <Box className={classes.eventsContainer}>
        <Events events={events} />
      </Box>
    </>
  );
};

const GoogleCalendarTaskList = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const connectedGoogleCalendars = useSelector(selectGoogleConnectedCalendars);
  const events = useSelector(selectGoogleCalendarEvents);

  const [hours, setHours] = useState(null);

  const generateHoursArray = () =>  {
    const items = [];
    new Array(25).fill().forEach((acc, index) => {
      items.push(moment({ hour: index } ).format('h:mm A'));
      items.push(moment({ hour: index, minute: 15 }).format('h:mm A'));
      items.push(moment({ hour: index, minute: 30 }).format('h:mm A'));
      items.push(moment({ hour: index, minute: 45 }).format('h:mm A'));
    })
    
    setHours(items.slice(0, items.length-3));
  };

  useEffect(() => {
    if (connectedGoogleCalendars) {
      connectedGoogleCalendars.map(cgc => {
        return dispatch(getEventsFromCalendars([cgc[1]]));
      })
    }
  }, [dispatch, connectedGoogleCalendars])

  useEffect(() => {
    generateHoursArray()
  }, [dispatch]);
  
  const showGoogleCalendarList = () => {
    history.push("/dashboard/google-calendar-list");  
  };

  return (
    <Box className={classes.container}>
      {cond([
        [() => ((connectedGoogleCalendars.length === 0) && (events.length === 0)), () => (
          <>
            <EmptyState tab={GOOGLE_CALENDAR_TASK_LIST} />
            <ConnectButton onClick={() => showGoogleCalendarList()} variant="contained">Connect Calendar</ConnectButton>
          </>
        )],
        [() => hours && events &&  hours.length > 0, () => (
          <CalendarTaskList hours={hours} events={events} />
        )]
       ])}
    </Box>
  )
};

CalendarTaskList.propTypes = {
  hours: PropTypes.arrayOf(PropTypes.string).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default GoogleCalendarTaskList;