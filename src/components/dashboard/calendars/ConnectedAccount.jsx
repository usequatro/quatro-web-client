import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { makeStyles } from '@material-ui/core/styles';

import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';

import firebase, { firebaseUnlinkProvider } from '../../../firebase';
import REGION from '../../../constants/region';
import { revokeAllScopes, gapiGetAuthInstance } from '../../../googleApi';
import { useNotification } from '../../Notification';
import GoogleButton from '../../ui/GoogleButton';
import {
  selectGapiUserLoading,
  selectGapiUserId,
  selectGapiHasAllCalendarScopes,
  selectGapiHasCalendarListScope,
  selectGapiHasEventsManageScope,
  selectPasswordFirebaseAuthProvider,
  selectGoogleFirebaseAuthProvider,
  setUserFromFirebaseUser,
  setGapiUser,
} from '../../../modules/session';
import {
  selectUserExternalConfigIsFetching,
  selectUserHasGrantedGoogleCalendarOfflineAccess,
} from '../../../modules/userExternalConfig';
import useGoogleApiSignIn from '../../hooks/useGoogleApiSignIn';
import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import debugConsole from '../../../utils/debugConsole';
import { useMixpanel } from '../../tracking/MixpanelContext';
import { GOOGLE_ACCOUNT_UNLINKED } from '../../../constants/mixpanelEvents';

const useStyles = makeStyles(() => ({
  listItem: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const PermissionInfoDialog = ({ title, content, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(setOpen)}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitleWithClose onClose={() => setOpen(false)} title={title} />
        <DialogContent>
          {typeof content === 'string' ? <DialogContentText>{content}</DialogContentText> : content}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
PermissionInfoDialog.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  children: PropTypes.func.isRequired,
};

// const GoogleOAuthBetaMessage = () => (
//   /* eslint-disable react/jsx-curly-brace-presence */
//   <>
//     <Typography variant="body2" color="textSecondary" paragraph>
//       {`Heads up! Quatro is still in beta mode and we haven't finished the `}
//       <MuiLink href="https://support.google.com/cloud/answer/7454865" target="_blank">
//         Google OAuth API verification
//       </MuiLink>
//       {` process.`}
//     </Typography>

//     <Typography variant="body2" color="textSecondary" paragraph>
//       {`When granting access to your calendar, you'll see a security warning from Google.
//       Click "Advanced" to reveal the option "Go to Quatro".`}
//     </Typography>

//     <Typography variant="body2" color="textSecondary" paragraph>
//       {`For more information, check out our `}
//       <MuiLink href="https://usequatro.com/faq" target="_blank">
//         FAQs
//       </MuiLink>
//       {` and review our `}
//       <MuiLink href="https://usequatro.com/privacy-policy" target="_blank">
//         Privacy Policy
//       </MuiLink>
//       {`.`}
//     </Typography>
//   </>
//   /* eslint-enable react/jsx-curly-brace-presence */
// );

const ConnectedAccount = ({ uid, imageUrl, email, name, providerId }) => {
  const { notifyError } = useNotification();
  const dispatch = useDispatch();
  const mixpanel = useMixpanel();
  const classes = useStyles();
  const gapiUserLoading = useSelector(selectGapiUserLoading);
  const gapiUserId = useSelector(selectGapiUserId);
  const isCurrentlyConnected = uid === gapiUserId;

  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);
  const gapiHasCalendarListAccess = useSelector(selectGapiHasCalendarListScope);
  const gapiHasEventsManageAccess = useSelector(selectGapiHasEventsManageScope);

  const userExternalConfigIsFetching = useSelector(selectUserExternalConfigIsFetching);
  const userHasGrantedGoogleCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );
  const passwordProvider = useSelector(selectPasswordFirebaseAuthProvider);
  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const { grantAccessToGoogleCalendar, signInAlreadyConnectedGoogleAccount } = useGoogleApiSignIn();
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
      .then(() => {
        if (providerId === 'google.com') {
          mixpanel.track(GOOGLE_ACCOUNT_UNLINKED);
        }
      })
      .then(async () => {
        if (providerId === 'google.com') {
          if (isCurrentlyConnected) {
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
    <ListItem disableGutters className={classes.listItem}>
      <Box display="flex" mb={2} alignItems="center">
        <ListItemAvatar>
          <Avatar
            alt={name || email}
            src={imageUrl}
            style={{ opacity: isCurrentlyConnected ? 1 : 0.5 }}
          />
        </ListItemAvatar>

        <Box display="flex" flexDirection="column" flexGrow={1}>
          <Typography variant="body1">{name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {email}
          </Typography>
        </Box>

        {/* if there's a password provider, we can let users disconnect other providers */}
        {passwordProvider && (
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

                  isCurrentlyConnected && gapiHasAllCalendarScopes
                    ? `Additionally, we'll automatically revoke Quatro's access to your Google Calendar events.`
                    : null,

                  !isCurrentlyConnected && gapiHasAllCalendarScopes && (
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
                variant="outlined"
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
        )}
      </Box>
      {!userExternalConfigIsFetching && isCurrentlyConnected && (
        <Box>
          <ul>
            <Typography
              variant="body2"
              color={gapiHasEventsManageAccess ? 'textSecondary' : 'error'}
              component="li"
            >
              {gapiHasEventsManageAccess
                ? 'Access to view and edit events'
                : 'No access to view and edit events'}
              <PermissionInfoDialog
                title="Access to view and edit events"
                content={
                  <>
                    <DialogContentText>
                      Quatro needs read access to your events to display them for you on the
                      interface.
                    </DialogContentText>
                    <DialogContentText>
                      Quatro needs edit access to your events to create blocks for your Quatro tasks
                      and keep them up to date.
                    </DialogContentText>
                    <DialogContentText>
                      {`Quatro doesn't store any data from your events. Quatro only keeps track of their
                      internal identifier so they can be associated to tasks.`}
                    </DialogContentText>
                  </>
                }
              >
                {(setOpen) => (
                  <IconButton
                    size="small"
                    aria-label="Show information about why view and edit events access is needed"
                    onClick={() => setOpen(true)}
                  >
                    <HelpOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </PermissionInfoDialog>
            </Typography>

            <Typography
              variant="body2"
              color={gapiHasCalendarListAccess ? 'textSecondary' : 'error'}
              component="li"
            >
              {gapiHasCalendarListAccess
                ? 'Access to list calendars'
                : 'No access to list calendars'}
              <PermissionInfoDialog
                title="Access to list calendars"
                content={
                  <>
                    <DialogContentText>
                      Quatro needs read access to your calendars to enable you to connect calendars.
                    </DialogContentText>
                    <DialogContentText>
                      Quatro stores only the calendar identifiers and email address associated with
                      it.
                    </DialogContentText>
                  </>
                }
              >
                {(setOpen) => (
                  <IconButton
                    size="small"
                    aria-label="Show information about why view and edit events access is needed"
                    onClick={() => setOpen(true)}
                  >
                    <HelpOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </PermissionInfoDialog>
            </Typography>

            <Typography
              variant="body2"
              color={userHasGrantedGoogleCalendarOfflineAccess ? 'textSecondary' : 'error'}
              component="li"
            >
              {userHasGrantedGoogleCalendarOfflineAccess
                ? 'Offline access (in the background)'
                : 'No offline access (in the background)'}

              <PermissionInfoDialog
                title="Offline access (in the background)"
                content={
                  <>
                    <DialogContentText>Quatro uses offline access to:</DialogContentText>
                    <ul>
                      <DialogContentText component="li">
                        Listen to changes to your calendars and the Google Calendar events in your
                        calendars
                      </DialogContentText>
                      <DialogContentText component="li">
                        Keep the Google Calendar events loaded on the interface up to date
                      </DialogContentText>
                      <DialogContentText component="li">
                        Update task calendar blocks when their associated Google Calendar events are
                        updated or removed
                      </DialogContentText>
                      <DialogContentText component="li">
                        Create, update and delete Google Calendar events associated to tasks in the
                        Service
                      </DialogContentText>
                    </ul>
                    <DialogContentText>
                      It applies only to calendars explicitly connected to Quatro. Disconnecting a
                      calendar will result on these offline communications immediately stopping.
                      Disconnecting your Google Account or deleting your Quatro account will also
                      result in the offline access tokens being revoked and deleted.
                    </DialogContentText>
                  </>
                }
              >
                {(setOpen) => (
                  <IconButton
                    size="small"
                    aria-label="Show information about why offline access is needed"
                    onClick={() => setOpen(true)}
                  >
                    <HelpOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                )}
              </PermissionInfoDialog>
            </Typography>
          </ul>
        </Box>
      )}

      <Box>
        {cond([
          [() => gapiUserLoading || userExternalConfigIsFetching, () => null],
          [
            () => !isCurrentlyConnected,
            () => (
              <>
                <Typography variant="body2" color="textSecondary" component="div">
                  {`Sign in with Google again to ${googleFirebaseAuthProvider.email} to view your calendars`}
                </Typography>
                <Box mt={2} display="flex" justifyContent="center">
                  <GoogleButton
                    onClick={signInAlreadyConnectedGoogleAccount}
                    data-qa="sign-in-google-button"
                    endIcon={
                      signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                    }
                  >
                    Sign in with Google
                  </GoogleButton>
                </Box>
              </>
            ),
          ],
          [
            () => !gapiHasAllCalendarScopes || !userHasGrantedGoogleCalendarOfflineAccess,
            () => (
              <>
                <Box mt={2} display="flex" flexDirection="column">
                  {/* <GoogleOAuthBetaMessage /> */}

                  <Box display="flex" justifyContent="center">
                    <GoogleButton
                      onClick={handleGrantAccessToCalendar}
                      data-qa="connect-google-button"
                      endIcon={
                        signingIn && <CircularProgress color="inherit" thickness={6} size="1rem" />
                      }
                    >
                      Grant access with Google
                    </GoogleButton>
                  </Box>
                </Box>
              </>
            ),
          ],
        ])()}
      </Box>
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
