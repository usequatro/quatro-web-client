import React from 'react';

import { cond } from 'lodash';
import Box from '@material-ui/core/Box';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";

import {
  selectConnectedGoogleCalendars,
} from '../../modules/googleCalendar';
import { GOOGLE_CALENDAR_TASK_LIST } from '../../constants/dashboardTabs';
import EmptyState from '../dashboard/tasks/EmptyState';

const useStyles = makeStyles(() => ({
  container: {
    paddingHorizontal: 90,
    paddingTop: 130,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column'
  },
}));


const ConnectButton = withStyles((theme) => ({
  root: {
    color: theme.palette.common.white, 
    backgroundColor: theme.palette.grey[900],
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
    borderRadius: '2em',
    padding: '1em 1.5em'
  },
}))(Button);

const GoogleCalendarTaskList = () => {
  const classes = useStyles();
  const history = useHistory();
  const connectedGoogleCalendars = useSelector(selectConnectedGoogleCalendars);

  const showGoogleCalendarList = () => {
    history.push("/dashboard/google-calendar-list");  
  };

  const renderCalendarTaskList = () => {
    connectedGoogleCalendars.map((cal, index) => {
      return (
        <div key={index}><p>Calendar List</p></div>
      )
    })
  }

  return (
    <Box className={classes.container}>
      {cond([
         [() => connectedGoogleCalendars.length === 0, () => (
            <>
              <EmptyState tab={GOOGLE_CALENDAR_TASK_LIST} />
              <ConnectButton onClick={() => showGoogleCalendarList()} variant="contained">Connect Calendar</ConnectButton>
            </>
         )],
       ])}
    </Box>
  )
};

// [() => true, () => { renderCalendarTaskList() }]

export default GoogleCalendarTaskList;