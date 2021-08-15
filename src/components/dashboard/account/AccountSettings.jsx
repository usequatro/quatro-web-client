import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import MuiLink from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import firebase, {
  firebaseUpdateUserProfile,
  firebaseUpdateUserEmail,
  firebaseUpdateUserPassword,
  firebaseDeleteUser,
  firebaseReauthenticateUserWithPassword,
} from '../../../firebase';
import { revokeAllScopes } from '../../../googleApi';
import PasswordTextField from '../../ui/PasswordTextField';
import Confirm from '../../ui/Confirm';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import AsyncFileUploadInput, { ERROR_IMAGE_SIZE } from '../../ui/AsyncFileUploadInput';
import PasswordConfirmDialog from './PasswordConfirmDialog';
import GoogleSignInConfirmDialog from './GoogleSignInConfirmDialog';
import {
  selectUserId,
  selectUserDisplayName,
  selectUserEmail,
  selectUserEmailVerified,
  selectUserPhotoURL,
  setUserFromFirebaseUser,
  selectPasswordFirebaseAuthProvider,
  selectGoogleFirebaseAuthProvider,
} from '../../../modules/session';
import { useNotification } from '../../Notification';
import UserIcon from '../../icons/UserIcon';
import {
  selectUserTimeZone,
  selectUserEmailDailyDigestEnabled,
  selectUserExternalConfigIsFetching,
} from '../../../modules/userExternalConfig';
import { fetchUpdateUserExternalConfig } from '../../../utils/apiClient';
import { getDesktopClientVersion } from '../../../utils/applicationClient';
import {
  getBrowserDetectedTimeZone,
  hasBrowserTimeZoneSupport,
  isValidTimeZone,
} from '../../../utils/timeZoneUtils';
import EmailVerificationBehavior from '../../email-verification/EmailVerificationBehavior';

const ERROR_TOO_MANY_REQUESTS = 'auth/too-many-requests';
const ERROR_LIST_REQUIRES_RECENT_LOGIN = [
  'auth/requires-recent-login',
  'CREDENTIAL_TOO_OLD_LOGIN_AGAIN',
];
const MAX_AVATAR_SIZE_MB = 1.5;
const ERROR_WRONG_PASSWORD = 'auth/wrong-password';
const userFacingErrors = {
  [ERROR_IMAGE_SIZE]: `Image is larger than ${MAX_AVATAR_SIZE_MB} MB. Please use a smaller image`,
  [ERROR_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later',
  [ERROR_WRONG_PASSWORD]: 'Wrong password',
};

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '100vw',
    width: '30rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  profilePhoto: {
    borderRadius: '100%',
    width: '7.5rem',
    height: '7.5rem',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
}));

// Making google's profile URL larger, as by default it might be 96
const resizeGoogleProfileUrl = (profileUrl, size = 200) =>
  (profileUrl || '').replace(/=s([0-9])+/, `=s${size}`);

const AccountSettings = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { notifyError, notifySuccess } = useNotification();

  const [submitting, setSubmitting] = useState(false);
  const emailVerified = useSelector(selectUserEmailVerified) || false;
  const userId = useSelector(selectUserId);

  const passwordAuthProvider = useSelector(selectPasswordFirebaseAuthProvider);
  const googleFirebaseAuthProvider = useSelector(selectGoogleFirebaseAuthProvider);

  const userExternalConfigLoaded = !useSelector(selectUserExternalConfigIsFetching);
  const userTimeZone = useSelector(selectUserTimeZone);
  const browserSupportsIntlTimeZone = useMemo(hasBrowserTimeZoneSupport, []);
  const userTimeZoneIsValid = useMemo(
    () => Boolean(userTimeZone && isValidTimeZone(userTimeZone)),
    [userTimeZone],
  );
  const browserTimeZone = useMemo(getBrowserDetectedTimeZone, []);

  const savedEmailDailyDigestEnabled = useSelector(selectUserEmailDailyDigestEnabled);
  const [emailDailyDigestEnabled, setEmailDailyDigestEnabled] = useState(
    savedEmailDailyDigestEnabled,
  );
  useEffect(() => {
    setEmailDailyDigestEnabled(savedEmailDailyDigestEnabled);
  }, [savedEmailDailyDigestEnabled]);

  const savedEmail = useSelector(selectUserEmail);
  const [email, setEmail] = useState(savedEmail || '');
  useEffect(() => {
    if (savedEmail && email !== savedEmail) {
      setEmail(savedEmail);
    }
  }, [savedEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedDisplayName = useSelector(selectUserDisplayName);
  const [displayName, setDisplayName] = useState(savedDisplayName || '');
  useEffect(() => {
    if (savedDisplayName && displayName !== savedDisplayName) {
      setDisplayName(savedDisplayName);
    }
  }, [savedDisplayName]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedPhotoURL = useSelector(selectUserPhotoURL);
  const [photoURL, setPhotoURL] = useState(savedPhotoURL);
  useEffect(() => {
    if (photoURL !== savedPhotoURL) {
      setPhotoURL(savedPhotoURL);
    }
  }, [savedPhotoURL]); // eslint-disable-line react-hooks/exhaustive-deps
  const [uploadingPhotoURL, setUploadingPhotoURL] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [recentLoginCallback, setRecentLoginCallback] = useState(null);

  const handleSave = (initialPromise = Promise.resolve()) => {
    setSubmitting(true);
    return initialPromise
      .then(() =>
        displayName !== savedDisplayName || photoURL !== savedPhotoURL
          ? firebaseUpdateUserProfile({
              ...(displayName !== savedDisplayName ? { displayName } : {}),
              ...(photoURL !== savedPhotoURL ? { photoURL } : {}),
            })
          : undefined,
      )
      .then(() =>
        email !== savedEmail && passwordAuthProvider ? firebaseUpdateUserEmail(email) : undefined,
      )
      .then(() => (newPassword !== '' ? firebaseUpdateUserPassword(email) : undefined))
      .then(() => {
        if (emailDailyDigestEnabled !== savedEmailDailyDigestEnabled) {
          fetchUpdateUserExternalConfig({ emailDailyDigestEnabled });
        }
      })
      .then(() => {
        notifySuccess('Changes saved successfully');
        setSubmitting(false);
        setNewPassword('');

        dispatch(setUserFromFirebaseUser(firebase.auth().currentUser));
      })
      .catch((error) => {
        if (ERROR_LIST_REQUIRES_RECENT_LOGIN.includes(error.code)) {
          setRecentLoginCallback(() => handleSave);
          return;
        }
        console.error(error); // eslint-disable-line no-console
        notifyError(userFacingErrors[error.code] || 'Error saving changes');
        setSubmitting(false);
      });
  };

  const handleDeleteAccount = () => {
    Promise.resolve()
      // first revoke Google API scopes
      // @todo: maybe this can be done async by a function?
      .then(() => revokeAllScopes())
      // then delete the user.
      // Ensure it's after signing out Google API, otherwise the auth flow re-creates the user
      .then(() => firebaseDeleteUser())
      .then(() => {
        // Redirect to initial screen to reset the Redux
        window.location = window.location.origin;
      })
      .catch((error) => {
        if (ERROR_LIST_REQUIRES_RECENT_LOGIN.includes(error.code)) {
          setRecentLoginCallback(() => handleDeleteAccount);
          return;
        }
        console.error(error); // eslint-disable-line no-console
        notifyError(userFacingErrors[error.code] || 'Error saving changes');
      });
  };

  const handleRecentLoginWithPassword = (password) => {
    setSubmitting(true);

    const recentLoginCallbackReference = recentLoginCallback;

    firebaseReauthenticateUserWithPassword(password)
      .then(() => {
        setRecentLoginCallback(null);
        return recentLoginCallbackReference();
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error); // eslint-disable-line no-console
        notifyError(userFacingErrors[error.code] || 'Error saving changes');
      });
  };

  const handleSetTimeZoneToBrowserTimeZone = () => {
    if (!browserTimeZone) {
      throw new Error('No browserTimeZone');
    }
    fetchUpdateUserExternalConfig({ timeZone: browserTimeZone });
  };

  const hasChanges =
    displayName !== savedDisplayName ||
    email !== savedEmail ||
    newPassword !== '' ||
    photoURL !== savedPhotoURL ||
    emailDailyDigestEnabled !== savedEmailDailyDigestEnabled;

  const desktopClientVersion = getDesktopClientVersion();

  return (
    <Box
      className={classes.container}
      py={4}
      px={2}
      style={{ opacity: submitting ? 0.5 : 1 }}
      flexGrow={1}
      alignSelf="center"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        <Box display="flex" justifyContent="center">
          <Tooltip title="Set profile picture" arrow>
            <label htmlFor="profile-pic-upload-input">
              {cond([
                [() => uploadingPhotoURL, () => <CircularProgress thickness={4} size="2rem" />],
                [
                  () => photoURL,
                  () => (
                    <ButtonBase
                      focusRipple
                      className={classes.profilePhoto}
                      style={{
                        backgroundImage: googleFirebaseAuthProvider
                          ? `url("${resizeGoogleProfileUrl(photoURL)}")`
                          : `url("${photoURL}")`,
                      }}
                      component="span"
                    />
                  ),
                ],
                [
                  () => true,
                  () => (
                    <IconButton
                      aria-label="Upload profile picture"
                      component="span"
                      disabled={uploadingPhotoURL}
                    >
                      {uploadingPhotoURL ? (
                        <CircularProgress thickness={4} size="2rem" />
                      ) : (
                        <UserIcon fontSize="large" />
                      )}
                    </IconButton>
                  ),
                ],
              ])()}
            </label>
          </Tooltip>

          <AsyncFileUploadInput
            id="profile-pic-upload-input"
            accept="image/*"
            maxSizeMB={MAX_AVATAR_SIZE_MB}
            userId={userId}
            onStartUpload={() => setUploadingPhotoURL(true)}
            onChangeComplete={({ url }) => {
              setUploadingPhotoURL(false);
              setPhotoURL(url);
            }}
            onError={(error) => {
              console.error(error); // eslint-disable-line no-console
              notifyError(userFacingErrors[error.code] || 'Error uploading file');
              setUploadingPhotoURL(false);
            }}
          />
        </Box>

        <TextField
          fullWidth
          label="Full Name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          margin="normal"
        />

        {passwordAuthProvider && (
          <>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              margin="normal"
              helperText={emailVerified ? 'Email verified' : ''}
            />

            <EmailVerificationBehavior
              render={(onSendVerificationEmail, submittingVerification, sentVerification) => (
                <Alert severity="info">
                  Please verify your email address:
                  <br />
                  {sentVerification ? (
                    'Sent'
                  ) : (
                    <MuiLink
                      component="button"
                      type="button"
                      variant="body2"
                      disabled={Boolean(sentVerification || submittingVerification)}
                      onClick={onSendVerificationEmail}
                    >
                      Send verification email{' '}
                      {submittingVerification ? (
                        <CircularProgress thickness={4} size="1rem" />
                      ) : null}
                    </MuiLink>
                  )}
                </Alert>
              )}
            />

            <PasswordTextField
              fullWidth
              label="Change password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </>
        )}

        {googleFirebaseAuthProvider && (
          <Box my={4}>
            <Typography gutterBottom>Connected Google Account</Typography>
            <Typography variant="body2">{googleFirebaseAuthProvider.email}</Typography>
          </Box>
        )}

        {userExternalConfigLoaded && (
          <Box my={4}>
            <Typography gutterBottom>
              User Time Zone{' '}
              <Tooltip
                aria-hidden
                arrow
                title="Your time zone is used to manage recurring tasks reliably across locations"
              >
                <InfoOutlinedIcon style={{ fontSize: '1em' }} />
              </Tooltip>
            </Typography>
            <Typography variant="body2" gutterBottom>
              {(userTimeZone || 'None set').replace(/_/g, ' ')}
            </Typography>

            {userTimeZone && browserSupportsIntlTimeZone && !userTimeZoneIsValid && (
              <Typography variant="body2" color="error" gutterBottom>
                {`Time zone is invalid. Some functionality won't work. `}
                <MuiLink
                  component="button"
                  type="button"
                  onClick={handleSetTimeZoneToBrowserTimeZone}
                >
                  Change to {browserTimeZone.replace(/_/g, ' ')}
                </MuiLink>
              </Typography>
            )}

            {userTimeZone && browserTimeZone && userTimeZone !== browserTimeZone && (
              <Typography variant="body2" gutterBottom>
                {`Looks like your current time zone is
                  ${browserTimeZone.replace(/_/g, ' ')}`}
                <MuiLink
                  component="button"
                  type="button"
                  onClick={handleSetTimeZoneToBrowserTimeZone}
                >
                  Change to {browserTimeZone.replace(/_/g, ' ')}
                </MuiLink>
              </Typography>
            )}
          </Box>
        )}

        {userExternalConfigLoaded && (
          <Box my={4}>
            <Typography gutterBottom>
              {emailVerified
                ? `Email preferences`
                : `Email preferences (requires email to be verified)`}
            </Typography>

            <FormControlLabel
              disabled={!emailVerified}
              control={
                <Checkbox
                  color="primary"
                  checked={emailDailyDigestEnabled}
                  onChange={(event) => setEmailDailyDigestEnabled(event.target.checked)}
                  name="emailDailyDigestEnabled"
                />
              }
              label={
                <Typography component="span" variant="body2">
                  Daily Digest: every day at 8pm, receive an email detailing completed tasks from
                  the day and tomorrow’s Top 4
                </Typography>
              }
            />
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" pt={4}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting || !hasChanges || !userExternalConfigLoaded}
            endIcon={submitting ? <CircularProgress thickness={4} size="1.25rem" /> : null}
          >
            Save
          </Button>
        </Box>
      </form>

      <Box display="flex" justifyContent="flex-end" py={4}>
        <Confirm
          onConfirm={handleDeleteAccount}
          renderDialog={(open, onConfirm, onConfirmationClose) => (
            <ConfirmationDialog
              open={open}
              onClose={onConfirmationClose}
              onConfirm={onConfirm}
              id="confirm-delete-account"
              title="Delete account"
              body="This action will delete your Quatro account. There's no way back"
              buttonText="Delete account permanently"
            />
          )}
          renderContent={(onClick) => (
            <Button type="submit" color="inherit" disabled={submitting} onClick={onClick}>
              Delete account
            </Button>
          )}
        />
      </Box>

      <Box>
        <Typography color="textSecondary" variant="body2" align="center">
          Quatro v1
          {desktopClientVersion && `. Desktop client v${desktopClientVersion}`}
        </Typography>
      </Box>

      <PasswordConfirmDialog
        open={Boolean(typeof recentLoginCallback === 'function' && passwordAuthProvider)}
        onClose={() => setRecentLoginCallback(null)}
        onConfirm={handleRecentLoginWithPassword}
      />

      <GoogleSignInConfirmDialog
        open={Boolean(
          typeof recentLoginCallback === 'function' &&
            googleFirebaseAuthProvider &&
            !passwordAuthProvider,
        )}
        onClose={() => setRecentLoginCallback(null)}
      />
    </Box>
  );
};

export default AccountSettings;
