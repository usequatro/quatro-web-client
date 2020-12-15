import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import cond from 'lodash/cond';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonBase from '@material-ui/core/ButtonBase';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import AccountCircleRoundedIcon from '@material-ui/icons/AccountCircleRounded';

import {
  getAuth,
  sendEmailVerification,
  getUserProviders,
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  deleteUser,
  reauthenticateUserWithPassword,
} from '../../../firebase';
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
} from '../../../modules/session';
import { useNotification } from '../../Notification';

const ERROR_TOO_MANY_REQUESTS = 'auth/too-many-requests';
const ERROR_LIST_REQUIRES_RECENT_LOGIN = [
  'auth/requires-recent-login',
  'CREDENTIAL_TOO_OLD_LOGIN_AGAIN',
];
const ERROR_WRONG_PASSWORD = 'auth/wrong-password';
const userFacingErrors = {
  [ERROR_IMAGE_SIZE]: 'Image is larger than 1MB. Please use a smaller image',
  [ERROR_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later',
  [ERROR_WRONG_PASSWORD]: 'Wrong password',
};

const useStyles = makeStyles(() => ({
  container: {
    maxWidth: '100vw',
    width: '30rem',
    display: 'flex',
    flexDirection: 'column',
  },
  profilePhoto: {
    borderRadius: '100%',
    width: '7.5rem',
    height: '7.5rem',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
}));

const EmailVerificationText = ({ verified }) => {
  const { notifyError, notifySuccess } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSend = (event) => {
    event.preventDefault();
    setSubmitting(true);
    sendEmailVerification()
      .then(() => {
        notifySuccess('Verification email sent');
        setSubmitting(false);
        setSent(true);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
        notifyError(userFacingErrors[error.code] || 'Error sending verification email');
        setSubmitting(false);
      });
  };
  return verified ? (
    'Email verified'
  ) : (
    <>
      Your email needs to be verified&nbsp;
      <Button
        variant="text"
        onClick={onSend}
        size="small"
        color="primary"
        disabled={sent || submitting}
        endIcon={submitting ? <CircularProgress thickness={4} size="1rem" /> : null}
      >
        Send
      </Button>
    </>
  );
};

EmailVerificationText.propTypes = {
  verified: PropTypes.bool.isRequired,
};

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
  const providers = useMemo(getUserProviders, []);

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
          ? updateUserProfile({
              ...(displayName !== savedDisplayName ? { displayName } : {}),
              ...(photoURL !== savedPhotoURL ? { photoURL } : {}),
            })
          : undefined,
      )
      .then(() =>
        email !== savedEmail && providers.includes('password') ? updateUserEmail(email) : undefined,
      )
      .then(() => (newPassword !== '' ? updateUserPassword(email) : undefined))
      .then(() => {
        notifySuccess('Changes saved successfully');
        setSubmitting(false);
        setNewPassword('');

        dispatch(setUserFromFirebaseUser(getAuth().currentUser));
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
    deleteUser().catch((error) => {
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

    reauthenticateUserWithPassword(password).then(() => {
      setRecentLoginCallback(null);
      return recentLoginCallbackReference();
    });
  };

  const hasChanges =
    displayName !== savedDisplayName ||
    email !== savedEmail ||
    newPassword !== '' ||
    photoURL !== savedPhotoURL;

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
          <Tooltip title="Set profile picture">
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
                        backgroundImage: providers.includes('google.com')
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
                        <AccountCircleRoundedIcon fontSize="large" />
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
            maxSizeMB={1}
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

        <TextField
          fullWidth
          label={providers.includes('google.com') ? 'Email (managed by Google)' : 'Email'}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          margin="normal"
          disabled={!providers.includes('password')}
          helperText={<EmailVerificationText verified={emailVerified} />}
        />

        {providers.includes('password') && (
          <PasswordTextField
            fullWidth
            label="Change password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            margin="normal"
          />
        )}

        <Box display="flex" justifyContent="flex-end" pt={4}>
          <Button
            type="submit"
            color="primary"
            disabled={submitting || !hasChanges}
            endIcon={submitting ? <CircularProgress thickness={4} size="1.25rem" /> : null}
          >
            Save
          </Button>
        </Box>
      </form>

      <Box display="flex" justifyContent="flex-end" pt={4}>
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

      <PasswordConfirmDialog
        open={typeof recentLoginCallback === 'function' && providers.includes('password')}
        onClose={() => setRecentLoginCallback(null)}
        onConfirm={handleRecentLoginWithPassword}
      />

      <GoogleSignInConfirmDialog
        open={typeof recentLoginCallback === 'function' && providers.includes('google.com')}
        onClose={() => setRecentLoginCallback(null)}
      />
    </Box>
  );
};

export default AccountSettings;
