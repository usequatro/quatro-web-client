import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import {
  selectGapiUserSignedIn,
  selectGapiHasAllCalendarScopes,
  selectGoogleFirebaseAuthProvider,
  selectGapiUserLoading,
} from '../../../modules/session';
import DashboardCalendarView from './DashboardCalendarView';
import * as paths from '../../../constants/paths';
import EmptyState from '../tasks/EmptyState';
import ScheduledIcon from '../../icons/ScheduledIcon';
import LoaderScreen from '../../ui/LoaderScreen';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';

const CalendarDashboardRouting = () => {
  const history = useHistory();

  const gapiUserLoading = useSelector(selectGapiUserLoading);
  const fetchingCalendars = useSelector(selectCalendarsAreFetching);
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);
  const userHasGrantedGoogleCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );
  const calendarIds = useSelector(selectCalendarIds);

  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const goToConnectedCalendars = () => {
    history.push(paths.CALENDARS);
  };

  return (
    <Box>
      {cond([
        [() => gapiUserLoading || fetchingCalendars, () => <LoaderScreen delay={5000} />],
        [
          () =>
            !gapiUserSignedIn ||
            !gapiHasAllCalendarScopes ||
            !userHasGrantedGoogleCalendarOfflineAccess ||
            calendarIds.length === 0,
          () => {
            const hasConnectedAccount = googleFirebaseAuthProvider && !gapiUserSignedIn;
            return (
              <EmptyState
                Image={ScheduledIcon}
                text={
                  hasConnectedAccount
                    ? `Sign in with Google again to ${googleFirebaseAuthProvider.email} to view your calendars`
                    : ['Connect to Google Calendar', 'to view events and sync Quatro tasks.']
                }
              >
                <Button variant="contained" color="primary" onClick={goToConnectedCalendars}>
                  {hasConnectedAccount ? 'Sign in' : 'Connect Calendar'}
                </Button>
              </EmptyState>
            );
          },
        ],
        [() => true, () => <DashboardCalendarView />],
      ])}
    </Box>
  );
};

export default CalendarDashboardRouting;
