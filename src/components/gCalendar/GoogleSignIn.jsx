import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import * as dashboardTabs from '../../constants/dashboardTabs';
import EmptyState from '../dashboard/tasks/EmptyState';
import ConnectButton from './ConnectButton';

import {
  selectGoogleAPIClient,
  selectGoogleConnectedCalendars,
} from '../../modules/googleCalendar';

const tab = dashboardTabs.GOOGLE_CALENDAR

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    padding: 90,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    border: 'solid 1px rgba(0, 0, 0, 0.12)',
    resize: 'horizontal',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column'
  },
}));

const GoogleSignIn = () => {
  const classes = useStyles();
  const history = useHistory();
  const googleAPIClient = useSelector(selectGoogleAPIClient);
  const connectedGoogleCalendars = useSelector(selectGoogleConnectedCalendars);

  const connectGoogle = () => {
    googleAPIClient.auth2.getAuthInstance().signIn().then(() => {
      if (connectedGoogleCalendars.length === 0) {
        history.push("/dashboard/google-calendar-list");  
      }
    });
  };

  return (
    <Box className={classes.container}>
      <EmptyState tab={tab} />
      <ConnectButton onClick={() => connectGoogle()} variant="contained">Log-in to Google</ConnectButton>
    </Box>
  )
};

export default GoogleSignIn;