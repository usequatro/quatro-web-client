import React, { useState } from 'react';
import { Text, Box } from 'rebass/styled-components';
import { Link, withRouter } from 'react-router-dom';

import { getAuth } from '../../../firebase';
import { DASHBOARD, LOG_IN } from '../../../constants/paths';
import InputGroup from '../../ui/InputGroup';
import InputField from '../../ui/InputField';
import InvisibleForm from '../../ui/InvisibleForm';

import SubmitButton from './SubmitButton';
import ErrorMessage from './ErrorMessage';

const SignUp = ({ history }) => {
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSignUp = (event) => {
    event.preventDefault();
    setSubmitting(true);
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html?authuser=0#create-user-with-email-and-password
    getAuth().createUserWithEmailAndPassword(emailAddress, password)
      .then(({ user }) => {
        console.log('[SignUp] User registered, updating information.');
        if (user == null) {
          throw new Error('Error loading new user');
        } else {
          user.updateProfile({
            displayName: fullName,
          })
            .catch((error) => {
              console.error(error);
            })
            .then(() => {
              console.log('[SignUp] User updated, redirecting.');
              history.push(DASHBOARD);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
        setErrorMessage(error.message);
      });
  };

  return (
    <>
      <InvisibleForm onSubmit={onSignUp}>
        <InputGroup mb={4}>
          <InputField
            label="Full Name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <InputField
            label="Email Address"
            required
            type="email"
            value={emailAddress}
            onChange={(event) => setEmailAddress(event.target.value)}
          />
          <InputField
            label="Password"
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </InputGroup>
        {errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        <SubmitButton variant="primary" type="submit" submitting={submitting}>
          Sign Up
        </SubmitButton>
      </InvisibleForm>

      <Box mt={[4, 5]}>
        <Text color="textSecondary">
          {'Already have an account? '}
          <Link to={LOG_IN}>Log in</Link>
        </Text>
      </Box>
    </>
  );
};

export default withRouter(SignUp);
