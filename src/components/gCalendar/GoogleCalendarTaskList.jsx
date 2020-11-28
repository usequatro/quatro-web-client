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
    borderTop: `solid 1px ${theme.palette.divider}`,
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
  eventDefaultStyle: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 5,
    color: '#FFFFFF'
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
        <Box className={style}>
          <p>{tick}</p>
        </Box>
      ) 
    })
  );
};

const Events = ({events}) => {
  const classes = useStyles();

  return (
    events.map(event => {
      const totals = event.items.map(eventItem => {
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
          topDifferenceTicks: differenceDuration + extraTicks
        });
      });

      const color = classes[event.color]
      const top = -Math.abs(totals[0].topDifferenceTicks * renderedTickHeight);

      return (
        <Box 
          style={{ height: totals[0].eventHeight, top }}
          className={`${color} ${classes.eventDefaultStyle}`}
        >
          <Typography variant="p">
            {event.name}
          </Typography>
        </Box>
      )
    })
  )
};

const CalendarTaskList = ({hours, events}) => {
  return (
    <>
      <Ticks hours={hours} />
      <div style={{ position: 'relative', width: '100%', display: "flex", justifyContent: "flex-end" }}>
        <Events events={events} />
      </div>
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
  hours: PropTypes.arrayOf(PropTypes.object).isRequired,
  events: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default GoogleCalendarTaskList;