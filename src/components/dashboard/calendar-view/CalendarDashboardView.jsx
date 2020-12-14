import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import cond from 'lodash/cond';

import { selectCalendarIds } from '../../../modules/calendars';
import GoogleCalendarTaskList from './GoogleCalendarTaskList';
import * as paths from '../../../constants/paths';
import EmptyState, { CALENDAR } from '../tasks/EmptyState';
import GoogleButton from '../../ui/GoogleButton';
import { useGoogleAPI } from '../../GoogleAPI';

const CalendarDashboardView = () => {
  // const classes = useStyles();
  const history = useHistory();

  const { isSignedIn, signIn } = useGoogleAPI();
  const calendarIds = useSelector(selectCalendarIds);

  const showGoogleCalendarList = () => {
    history.push(paths.CALENDARS);
  };

  const connectGoogle = () => {
    signIn().then(() => {
      history.push(paths.CALENDARS);
    });
  };

  return (
    <Box>
      {cond([
        [
          () => !isSignedIn,
          () => (
            <EmptyState tab={CALENDAR}>
              <GoogleButton onClick={() => connectGoogle()}>Sign in with Google</GoogleButton>
            </EmptyState>
          ),
        ],
        [
          () => calendarIds.length === 0,
          () => (
            <EmptyState tab={CALENDAR}>
              <Button variant="contained" color="primary" onClick={() => showGoogleCalendarList()}>
                Connect Calendar
              </Button>
            </EmptyState>
          ),
        ],
        [() => true, () => <GoogleCalendarTaskList />],
      ])}
    </Box>
  );
};

export default CalendarDashboardView;
