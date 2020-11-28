import React, { useEffect, useState } from 'react';

import { cond } from 'lodash';
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

const tickHeight = 55;

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
    height: tickHeight,
    borderBottom: `solid 1px ${theme.palette.divider}`,
  },
  halfTick: {
    flex: 1,
    borderBottom: `solid 1px ${theme.palette.divider}`,
    width: '100%',
    height: tickHeight,
  },

  eventDuration: {
    width: '100%',
    border: `solid 0px ${theme.palette.divider}`,
    color:'white',
    height: 'auto'
  },
  radioMagenta: {
    backgroundColor: '#EB40AC',
    borderRadius: '1%',
    color:'white',
    borderBottom: `solid 0px ${theme.palette.divider}`,

  },
  radioOrange: {
    backgroundColor: '#F08934',
    borderRadius: '1%',
    color:'white',
    borderBottom: `solid 0px ${theme.palette.divider}`,
  
  },
  radioBlackboard: {
    backgroundColor: '#3C717B',
    borderRadius: '1%',
    color:'white',
  },
  date: {
    padding: 20,
  }
}));

const CalendarTaskList = ({hours, events}) => {
  const classes = useStyles();

  return (
    hours.map(tick => {
      let coloredTick = false;
      let eventName = '';
      let color = '';
      let totalEventDuration = 0;
      let hourStyle = "";

      events.map(e => {
        e.items.map(ei => {    
          if (ei.start ) {
            const duration = moment(ei.end.dateTime).diff(moment(ei.start.dateTime))
            const d = moment.duration(duration, 'milliseconds');
            const minDuration = Math.floor(d.asMinutes() / 30);
            const eventStart = moment(ei.start.dateTime).format('h:mm A')
            if (eventStart === tick) {
              coloredTick = true;
              eventName = ei.summary;
              color = classes[e.color]
              totalEventDuration = tickHeight * minDuration
            }
          }
          return null;
        })
      return null;  
      });
      if (coloredTick){
        hourStyle = classes.eventDuration
      } else {
        hourStyle = classes.tick;
      }
      const defaultStyles = `${hourStyle} ${coloredTick && color}`;

      return (
        <div coloredTick={coloredTick} style={{ width: '100%', minHeight: tickHeight }}>
        <Box
          style={{ height:totalEventDuration }}
          className={defaultStyles}
        >
          <p className={classes.date}>
            {tick}
            {' '}
            {eventName}
          </p>
        </Box>
        </div>
      )
    })
  )
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
      items.push(moment({ hour: index, minute: 30 }).format('h:mm A'));
    })
    setHours(items.slice(0, items.length-1));
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

export default GoogleCalendarTaskList;