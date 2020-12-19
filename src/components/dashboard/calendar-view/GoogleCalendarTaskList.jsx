import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';

import { selectCalendarIds } from '../../../modules/calendars';
import { loadAllEvents, clearEvents } from '../../../modules/calendarEvents';

import CalendarNavBar from './CalendarNavBar';
import Ticks from './Ticks';
import CalendarEventList from './CalendarEventList';
import CurrentTimeLine from './CurrentTimeLine';
import { selectGapiUserSignedIn } from '../../../modules/session';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
}));

const GoogleCalendarTaskList = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const googleSignedIn = useSelector(selectGapiUserSignedIn);

  const [date, setDate] = useState(new Date());

  const calendarIds = useSelector(selectCalendarIds);
  useEffect(() => {
    if (!googleSignedIn) {
      return;
    }
    dispatch(clearEvents());
    dispatch(loadAllEvents(calendarIds, date));
  }, [dispatch, googleSignedIn, calendarIds, date]);

  return (
    <>
      <CalendarNavBar date={date} onChange={(newDate) => setDate(newDate)} />
      <Box className={classes.container}>
        <CalendarEventList />
        <Ticks />
        <CurrentTimeLine />
      </Box>
    </>
  );
};

export default GoogleCalendarTaskList;
