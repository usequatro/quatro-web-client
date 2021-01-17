import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import {
  selectGapiUserSignedIn,
  selectGapiUserHasCalendarAccess,
  selectGoogleFirebaseAuthProvider,
  selectGapiUserLoading,
} from '../../../modules/session';
import CalendarView from '../calendar-view/CalendarView';
import * as paths from '../../../constants/paths';
import EmptyState, { IMAGE_CALENDAR } from '../tasks/EmptyState';
import LoaderScreen from '../../ui/LoaderScreen';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';

const CalendarDashboardView = () => {
  const history = useHistory();

  const gapiUserLoading = useSelector(selectGapiUserLoading);
  const fetchingCalendars = useSelector(selectCalendarsAreFetching);
  const gapiUserSignedIn = useSelector(selectGapiUserSignedIn);
  const gapiUserHasCalendarAccess = useSelector(selectGapiUserHasCalendarAccess);
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
            !gapiUserHasCalendarAccess ||
            !userHasGrantedGoogleCalendarOfflineAccess ||
            calendarIds.length === 0,
          () => {
            const hasConnectedAccount = googleFirebaseAuthProvider && !gapiUserSignedIn;
            return (
              <EmptyState
                image={IMAGE_CALENDAR}
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
        [() => true, () => <CalendarView />],
      ])}
    </Box>
  );
};

export default CalendarDashboardView;
