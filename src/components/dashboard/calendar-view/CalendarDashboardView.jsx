import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import cond from 'lodash/cond';
import { makeStyles } from '@material-ui/core/styles';

import { selectCalendarIds } from '../../../modules/calendars';
import GoogleSignIn from './GoogleSignIn';
import GoogleCalendarTaskList from './GoogleCalendarTaskList';
import * as paths from '../../../constants/paths';
import EmptyState, { CALENDAR } from '../tasks/EmptyState';
import { useGoogleAPI } from '../../GoogleAPI';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    paddingTop: '6em',
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    border: 'solid 1px rgba(0, 0, 0, 0.12)',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    height: '100vh',
    [theme.breakpoints.down('sm')]: {
      paddingTop: '2em',
    },
  },
  directions: {
    position: 'absolute',
    top: '90px',
    right: '-23px',
  },
}));

const CalendarDashboardView = () => {
  const classes = useStyles();
  const history = useHistory();

  const { isSignedIn } = useGoogleAPI();
  const calendarIds = useSelector(selectCalendarIds);

  const showGoogleCalendarList = () => {
    history.push(paths.CALENDARS);
  };

  return (
    <Box>
      {cond([
        [() => !isSignedIn, () => <GoogleSignIn />],
        [
          () => calendarIds.length === 0,
          () => (
            <Box className={classes.container}>
              <EmptyState tab={CALENDAR}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => showGoogleCalendarList()}
                >
                  Connect Calendar
                </Button>
              </EmptyState>
            </Box>
          ),
        ],
        [
          () => true,
          () => (
            <Box className={classes.container}>
              <GoogleCalendarTaskList />
            </Box>
          ),
        ],
      ])}
    </Box>
  );
};

export default CalendarDashboardView;
