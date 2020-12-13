import React from 'react';
import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import EmptyState, { CALENDAR } from '../tasks/EmptyState';
import * as paths from '../../../constants/paths';

import GoogleButton from '../../ui/GoogleButton';
import { useGoogleAPI } from '../../GoogleAPI';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    alignContent: 'center',
    resize: 'horizontal',
    overflow: 'auto',
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      padding: 90,
      border: 'solid 1px rgba(0, 0, 0, 0.12)',
    },
  },
}));

const GoogleSignIn = () => {
  const classes = useStyles();
  const history = useHistory();
  const { signIn } = useGoogleAPI();

  const connectGoogle = () => {
    signIn().then(() => {
      history.push(paths.CALENDARS);
    });
  };

  return (
    <Box className={classes.container}>
      <EmptyState tab={CALENDAR}>
        <GoogleButton onClick={() => connectGoogle()}>Sign in with Google</GoogleButton>
      </EmptyState>
    </Box>
  );
};

export default GoogleSignIn;
