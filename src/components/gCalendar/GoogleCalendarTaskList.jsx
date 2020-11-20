import React, { useEffect, useState } from 'react';

import { cond } from 'lodash';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
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

const useStyles = makeStyles(() => ({
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
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    width: '100%',
    minHeight: 55
  },
  halfTick: {
    flex: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    width: '100%',
    minHeight: 55
  },
  colored: {
    backgroundColor: '#b0b341'
  }
}));

const CalendarTaskList = ({hours, events}) => {
  const classes = useStyles();  
  return (
    hours.map(tick => {
      const hourStyle = tick.includes(':00') ? classes.tick: classes.halfTick;
      let coloredTick = false;
      let eventName = '';

      events.map(e => {
        e.items.map(ei => {
          if (ei.start) {
            const eventStart = moment(ei.start.dateTime).format('h:mm A')
            console.log('eventName', ei)
            if (eventStart === tick) {
              coloredTick = true;
              eventName = ei.summary;
            }
          }
          return null;
        })
        return null;
      });

      return (
        <Paper className={[hourStyle, coloredTick && classes.colored]}>
          <p>
            {tick}
            {' '}
            {eventName}
          </p>
        </Paper>
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
    generateHoursArray()
  }, [])

  useEffect(() => {
    dispatch(getEventsFromCalendars());
  }, [dispatch, connectedGoogleCalendars])
  
  const showGoogleCalendarList = () => {
    history.push("/dashboard/google-calendar-list");  
  };

  return (
    <Box className={classes.container}>
      {cond([
        [() => (connectedGoogleCalendars.length === 0), () => (
          <>
            <EmptyState tab={GOOGLE_CALENDAR_TASK_LIST} />
            <ConnectButton onClick={() => showGoogleCalendarList()} variant="contained">Connect Calendar</ConnectButton>
          </>
        )],
        [() => hours &&  hours.length > 0, () => (
          <CalendarTaskList hours={hours} events={events} />
        )]
       ])}
    </Box>
  )
};

export default GoogleCalendarTaskList;