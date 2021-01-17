import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiLink from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import firebase, { firebaseUnlinkProvider } from '../../../firebase';
import REGION from '../../../constants/region';
import { revokeAllScopes, gapiGetAuthInstance } from '../../../googleApi';
import { useNotification } from '../../Notification';
import GoogleButton from '../../ui/GoogleButton';
import {
  selectGapiUserId,
  selectGapiUserHasCalendarAccess,
  selectPasswordFirebaseAuthProvider,
  setUserFromFirebaseUser,
  setGapiUser,
} from '../../../modules/session';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';
import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import debugConsole from '../../../utils/debugConsole';

const useStyles = makeStyles((theme) => ({
  listItemWithSecondaryAction: {
    paddingRight: theme.spacing(10), // increased padding bc disconnect button isn't an IconButton
  },
  secondaryActionContainer: {
    right: 0,
  },
}));

const ConnectedAccount = ({ uid, imageUrl, email, name, providerId }) => {
  const { notifyError } = useNotification();
  const dispatch = useDispatch();
  const classes = useStyles();
  const gapiUserId = useSelector(selectGapiUserId);
  const isConnectedAccount = uid === gapiUserId;

  const googleUserHasCalendarAccess = useSelector(selectGapiUserHasCalendarAccess);
  const userHasGrantedGoogleCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );
  const passwordProvider = useSelector(selectPasswordFirebaseAuthProvider);

  const { grantAccessToGoogleCalendar } = useGoogleApiSignIn();
  const [signingIn, setSigningIn] = useState(false);
  const [disconnectingProvider, setDisconectingProvider] = useState(false);
  const handleGrantAccessToCalendar = () => {
    setSigningIn(true);
    grantAccessToGoogleCalendar().then(
      () => setSigningIn(false),
      () => setSigningIn(false),
    );
  };

  const handleDisconnect = () => {
    setDisconectingProvider(true);
    firebaseUnlinkProvider(providerId)
      .then(async () => {
        if (providerId === 'google.com') {
          if (isConnectedAccount) {
            debugConsole.info('Google API', 'Revoking scopes and signing out from Google API');
            return revokeAllScopes().then(async () => (await gapiGetAuthInstance()).signOut());
          }
          debugConsole.info(
            'Google API',
            'Not revoking scopes and signing out because account not signed in now',
          );
          return undefined;
        }
        debugConsole.info(`Unknown provider unlinked ${providerId}`);
        return undefined;
      })
      // We run the callable after the important things, as it'd be less bad if this failed
      .then(() => {
        const processProviderUnlink = firebase
          .app()
          .functions(REGION)
          .httpsCallable('processProviderUnlink');
        debugConsole.info(`Processing provider unlink ${providerId}`);
        return processProviderUnlink({
          unlinkedProviderId: providerId,
        }).then(() => {
          debugConsole.info(`Done processing provider unlink ${providerId}`);
        });
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError('An error happened');
      })
      // Reloading users regardless of errors, as it might have been in the middle of the process
      .then(async () => {
        dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));

        if (providerId === 'google.com') {
          const gapiAuthInstance = await gapiGetAuthInstance();
          dispatch(
            setGapiUser(
              gapiAuthInstance.isSignedIn.get() ? gapiAuthInstance.currentUser.get() : null,
            ),
          );
        }
      })
      .then(
        () => setDisconectingProvider(false),
        () => setDisconectingProvider(false),
      );
  };

  if (providerId !== 'google.com') {
    return 'Not implemented';
  }

  return (
    <ListItem disableGutters classes={{ secondaryAction: classes.listItemWithSecondaryAction }}>
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

      {/* if there's a password provider, we can let users disconnect other providers */}
      {passwordProvider && (
        <ListItemSecondaryAction className={classes.secondaryActionContainer}>
          <Confirm
            onConfirm={handleDisconnect}
            renderDialog={(open, onConfirm, onConfirmationClose) => (
              <ConfirmationDialog
                open={open}
                onClose={onConfirmationClose}
                onConfirm={onConfirm}
                id="confirm-disconnect-account"
                title="Disconnect account"
                body={[
                  `Are you sure you want to disconnect the Google account "${email}"?`,
                  `This will remove from Quatro any connected calendars of that account.`,

                  isConnectedAccount && googleUserHasCalendarAccess
                    ? `Additionally, we'll automatically revoke Quatro's access to your Google Calendar events.`
                    : null,

                  !isConnectedAccount && googleUserHasCalendarAccess && (
                    <>
                      {`Since you aren't currently signed in to Google in Quatro, we can't
                      automatically revoke our access to your events. In order for you to do that,
                      go to the security settings of your `}
                      <MuiLink href="https://myaccount.google.com/">
                        Google Account dashboard
                      </MuiLink>
                      .
                    </>
                  ),
                  `After you disconnect it, you'll still be able to log in with password using
                the email address ${passwordProvider.email}`,
                ]}
                buttonText="Disconnect"
              />
            )}
            renderContent={(onClick) => (
              <Button
                onClick={onClick}
                size="small"
                endIcon={
                  disconnectingProvider && (
                    <CircularProgress color="inherit" thickness={6} size="1rem" />
                  )
                }
              >
                {disconnectingProvider ? 'Disconnecting' : 'Disconnect'}
              </Button>
            )}
          />
        </ListItemSecondaryAction>
      )}
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
