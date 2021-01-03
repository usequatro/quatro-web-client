import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';

import GoogleButton from '../../ui/GoogleButton';
import { selectGapiUserId, selectGapiUserHasCalendarAccess } from '../../../modules/session';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';

const ConnectedAccount = ({ uid, imageUrl, email, name, providerId }) => {
  const gapiUserId = useSelector(selectGapiUserId);
  const isConnectedAccount = uid === gapiUserId;

  const googleUserHasCalendarAccess = useSelector(selectGapiUserHasCalendarAccess);
  const userHasGrantedGoogleCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );

  const { grantAccessToGoogleCalendar } = useGoogleApiSignIn();
  const [signingIn, setSigningIn] = useState(false);
  const handleGrantAccessToCalendar = () => {
    setSigningIn(true);
    grantAccessToGoogleCalendar().then(
      () => setSigningIn(false),
      () => setSigningIn(false),
    );
  };

  if (providerId !== 'google.com') {
    return 'Not implemented';
  }

  return (
    <ListItem disableGutters>
      <ListItemAvatar>
        <Avatar
          alt={name || email}
          src={imageUrl}
          style={{ opacity: isConnectedAccount ? 1 : 0.5 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={`${[name, email].filter(Boolean).join(' ')}`}
        secondaryTypographyProps={{ component: 'div' }}
        secondary={cond([
          [() => !isConnectedAccount, () => 'Not signed in with Google'],
          [
            () => !googleUserHasCalendarAccess || !userHasGrantedGoogleCalendarOfflineAccess,
            () => (
              <Box mt={2}>
                <p>
                  Grant access to display your calendars and create events, and sync your Quatro
                  tasks to Google Calendar.
                </p>
                <GoogleButton
                  onClick={handleGrantAccessToCalendar}
                  data-qa="connect-google-button"
                  endIcon={
                    signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                  }
                >
                  Grant access
                </GoogleButton>
              </Box>
            ),
          ],
        ])()}
      />
    </ListItem>
  );
};

ConnectedAccount.propTypes = {
  providerId: PropTypes.string.isRequired,
  uid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
};

export default ConnectedAccount;
