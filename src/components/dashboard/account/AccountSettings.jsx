import React, { useState, useEffect } from 'react';
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
  updateUserProfile,
  updateUserEmail,
  updateUserPassword,
  reauthenticateUser,
} from '../../../firebase';
import PasswordTextField from '../../ui/PasswordTextField';
import AsyncFileUploadInput, { ERROR_IMAGE_SIZE } from '../../ui/AsyncFileUploadInput';
import PasswordConfirmDialog from './PasswordConfirmDialog';
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
const ERROR_REQUIRES_RECENT_LOGIN = 'auth/requires-recent-login';
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

const AccountSettings = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { notifyError, notifySuccess } = useNotification();

  const [submitting, setSubmitting] = useState(false);
  const emailVerified = useSelector(selectUserEmailVerified) || false;
  const userId = useSelector(selectUserId);

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
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);

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
      .then(() => (email !== savedEmail ? updateUserEmail(email) : undefined))
      .then(() => (newPassword !== '' ? updateUserPassword(email) : undefined))
      .then(() => {
        notifySuccess('Changes saved successfully');
        setSubmitting(false);
        setNewPassword('');

        dispatch(setUserFromFirebaseUser(getAuth().currentUser));
      })
      .catch((error) => {
        if (error.code === ERROR_REQUIRES_RECENT_LOGIN) {
          setPasswordConfirmOpen(true);
          return;
        }
        console.error(error); // eslint-disable-line no-console
        notifyError(userFacingErrors[error.code] || 'Error saving changes');
        setSubmitting(false);
      });
  };

  const handleResave = (password) => {
    setSubmitting(true);
    setPasswordConfirmOpen(false);

    handleSave(reauthenticateUser(password));
  };

  const hasChanges =
    displayName !== savedDisplayName ||
    email !== savedEmail ||
    newPassword !== '' ||
    photoURL !== savedPhotoURL;

  return (
    <Box className={classes.container} py={4} px={2} style={{ opacity: submitting ? 0.5 : 1 }}>
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
                      style={{ backgroundImage: `url("${photoURL}")` }}
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
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          margin="normal"
          helperText={<EmailVerificationText verified={emailVerified} />}
        />

        <PasswordTextField
          fullWidth
          label="Change password"
          autoComplete="off"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          margin="normal"
        />

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

      <PasswordConfirmDialog
        open={passwordConfirmOpen}
        onClose={() => setPasswordConfirmOpen(false)}
        onConfirm={handleResave}
      />
    </Box>
  );
};

export default AccountSettings;
