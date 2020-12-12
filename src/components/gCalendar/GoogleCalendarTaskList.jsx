import React, { useEffect, useState } from 'react';

import { cond } from 'lodash';
import Box from '@material-ui/core/Box';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import format from 'date-fns/format';
import add from 'date-fns/add';
import startOfDay from 'date-fns/startOfDay';

import {
  selectGoogleConnectedCalendars,
  getEventsFromCalendars,
  selectGoogleCalendarEvents,
} from '../../modules/googleCalendar';

import { GOOGLE_CALENDAR_TASK_LIST } from '../../constants/dashboardTabs';
import EmptyState from '../dashboard/tasks/EmptyState';
import ConnectButton from './ConnectButton';
import CalendarTaskList from './CalendarTaskList';
import { useStyles } from './sharedStyles';

const GoogleCalendarTaskList = () => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const connectedGoogleCalendars = useSelector(selectGoogleConnectedCalendars);
  const events = useSelector(selectGoogleCalendarEvents);

  const [hours, setHours] = useState(null);

  const generateHoursArray = () => {
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

    setHours(items.slice(0, items.length - 3));
  };

  const showGoogleCalendarList = () => {
    history.push('/dashboard/google-calendar-list');
  };

  useEffect(() => {
    if (connectedGoogleCalendars) {
      connectedGoogleCalendars.map((cgc) => {
        return dispatch(getEventsFromCalendars([cgc[1]]));
      });
    }
  }, [dispatch, connectedGoogleCalendars]);

  useEffect(() => {
    generateHoursArray();
  }, [dispatch]);

  return (
    <Box className={classes.container}>
      {cond([
        [
          () => connectedGoogleCalendars.length === 0 && events.length === 0,
          () => (
            <>
              <EmptyState tab={GOOGLE_CALENDAR_TASK_LIST} />
              <ConnectButton onClick={() => showGoogleCalendarList()} variant="contained">
                Connect Calendar
              </ConnectButton>
            </>
          ),
        ],
        [
          () => hours && events && hours.length > 0,
          () => <CalendarTaskList hours={hours} events={events} />,
        ],
        [() => true, () => null],
      ])}
    </Box>
  );
};

export default GoogleCalendarTaskList;
