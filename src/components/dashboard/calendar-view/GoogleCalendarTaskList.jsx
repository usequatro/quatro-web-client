import React, { useEffect } from 'react';

import Box from '@material-ui/core/Box';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { selectCalendarIds } from '../../../modules/calendars';
import { loadAllEvents } from '../../../modules/calendarEvents';

import Ticks from './Ticks';
import CalendarEventList from './CalendarEventList';
import CurrentTimeLine from './CurrentTimeLine';

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

  const calendarIds = useSelector(selectCalendarIds);
  useEffect(() => {
    dispatch(loadAllEvents(calendarIds));
  }, [dispatch, calendarIds]);

  return (
    <Box className={classes.container}>
      <CalendarEventList />
      <Ticks />
      <CurrentTimeLine />
    </Box>
  );
};

export default GoogleCalendarTaskList;
