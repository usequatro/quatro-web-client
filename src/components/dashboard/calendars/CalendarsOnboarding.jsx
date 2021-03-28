import React from 'react';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import IconButton from '@material-ui/core/IconButton';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import CloseIcon from '@material-ui/icons/Close';
import Grow from '@material-ui/core/Grow';

import { selectCalendarIds, selectCalendarsAreFetching } from '../../../modules/calendars';
import {
  selectGapiHasAllCalendarScopes,
  selectGoogleFirebaseAuthProvider,
  selectUserId,
} from '../../../modules/session';
import useLocalStorage from '../../hooks/useLocalStorage';

const CalendarsOnboarding = () => {
  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);
  const userId = useSelector(selectUserId);
  const calendarIds = useSelector(selectCalendarIds);
  const calendarsAreFetching = useSelector(selectCalendarsAreFetching);
  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const [progress, stepNumber, message] = cond([
    [
      () => !googleFirebaseAuthProvider,
      () => [0, 0, 'Step 1: Connect the Google account with access to your primary calendar.'],
    ],
    [
      () => !gapiHasAllCalendarScopes,
      () => [
        33,
        1,
        'Step 2: Grant access to your Google Calendar account to view your existing meetings and block time for your top tasks.',
      ],
    ],
    [
      () => calendarIds.length === 0,
      () => [
        66,
        2,
        'Step 3: Add one or more calendars to Quatro to view your existing meetings and block time for your top tasks.',
      ],
    ],
    [
      () => true,
      () => [
        100,
        3,
        'You’re connected! Head back to your home screen to see your Top 4 alongside your connected calendar.',
      ],
    ],
  ])();

  const [showOnboarding, setShowOnboarding] = useLocalStorage(
    // passing part of userId to avoid issues if multiple users used the same browser
    `showCalendarsOnboarding-${(userId || '').substring(0, 6)}`,
    progress !== 100,
  );

  return (
    <Grow in={showOnboarding && !calendarsAreFetching} mountOnEnter unmountOnExit>
      <Box mb={6}>
        <Alert
          variant="outlined"
          severity="info"
          action={
            <Box alignSelf="flex-start">
              <IconButton
                aria-label="close onboarding tip"
                color="inherit"
                size="small"
                onClick={() => setShowOnboarding(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            </Box>
          }
        >
          <AlertTitle>Onboarding</AlertTitle>

          <Box display="flex" alignItems="center" mb={2}>
            <Box>
              <Typography>{`${progress} % (${stepNumber}/3)`}</Typography>
            </Box>
            <Box flexGrow={1} ml={2}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          </Box>

          <Typography variant="body2">{message}</Typography>
        </Alert>
      </Box>
    </Grow>
  );
};

export default CalendarsOnboarding;
