import { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { firebaseSendEmailVerification } from '../../firebase';
import { useNotification } from '../Notification';
import { selectUserEmailVerified } from '../../modules/session';

const ERROR_TOO_MANY_REQUESTS = 'auth/too-many-requests';
const userFacingErrors = {
  [ERROR_TOO_MANY_REQUESTS]: 'Too many attempts. Please try again later',
};

const EmailVerificationBehavior = ({ render }) => {
  const emailVerified = useSelector(selectUserEmailVerified) || false;

  const { notifyError, notifySuccess } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSendVerificationEmail = (event) => {
    event.preventDefault();
    if (sent) {
      return;
    }
    setSubmitting(true);
    firebaseSendEmailVerification()
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

  if (emailVerified) {
    return null;
  }

  return render(onSendVerificationEmail, submitting, sent);
};

EmailVerificationBehavior.propTypes = {
  render: PropTypes.func.isRequired,
};

export default EmailVerificationBehavior;
