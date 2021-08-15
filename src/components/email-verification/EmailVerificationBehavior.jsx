import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import throttle from 'lodash/throttle';

import { firebaseReloadUser, firebaseSendEmailVerification } from '../../firebase';
import { useNotification } from '../Notification';
import {
  selectUserEmail,
  selectUserEmailVerified,
  setUserFromFirebaseUser,
} from '../../modules/session';
import debugConsole from '../../utils/debugConsole';

const ERROR_TOO_MANY_REQUESTS = 'auth/too-many-requests';
const userFacingErrors = {
  [ERROR_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later',
};

const POLLING_INTERVAL = 5000;
const POLLING_WAIT = 5 * 60 * 1000;
const initUserReloadPolling = throttle((userEmail, callback) => {
  let attempts = 0;
  const interval = setInterval(() => {
    attempts += 1;
    if (attempts >= POLLING_WAIT / POLLING_INTERVAL) {
      clearInterval(interval);
      return;
    }
    firebaseReloadUser().then((updatedCurrentUser) => {
      if (updatedCurrentUser.email !== userEmail) {
        debugConsole.log('firebase', 'Non matching emails. Must have been changed. Stopping');
        clearInterval(interval);
      } else if (updatedCurrentUser.emailVerified) {
        debugConsole.log('firebase', 'Detected user verified their email');
        clearInterval(interval);
        callback(updatedCurrentUser);
      } else {
        debugConsole.log('firebase', "User didn't verify their email yet");
      }
    });
  }, POLLING_INTERVAL);
}, POLLING_WAIT);

const EmailVerificationBehavior = ({ render }) => {
  const userEmail = useSelector(selectUserEmail);
  const emailVerified = useSelector(selectUserEmailVerified) || false;
  const dispatch = useDispatch();

  const { notifyError, notifySuccess } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // When the email is changed, we reset the throttle
  useEffect(() => {
    initUserReloadPolling.cancel();
    setSent(false);
  }, [userEmail]);

  const onSendVerificationEmail = useCallback(
    (event) => {
      event.preventDefault();
      if (sent || submitting) {
        return;
      }
      setSubmitting(true);
      firebaseSendEmailVerification()
        .then(() => {
          notifySuccess('Verification email sent');
          setSubmitting(false);
          setSent(true);

          // Init a polling to automatically detect when the user has verified
          initUserReloadPolling(userEmail, (updatedCurrentUser) =>
            dispatch(setUserFromFirebaseUser(updatedCurrentUser)),
          );
        })
        .catch((error) => {
          console.error(error); // eslint-disable-line no-console
          notifyError(userFacingErrors[error.code] || 'Error sending verification email');
          setSubmitting(false);
        });
    },
    [dispatch, notifyError, notifySuccess, sent, submitting, userEmail],
  );

  if (emailVerified) {
    return null;
  }

  return render(onSendVerificationEmail, submitting, sent);
};

EmailVerificationBehavior.propTypes = {
  render: PropTypes.func.isRequired,
};

export default EmailVerificationBehavior;
