import React, { useState } from 'react';
import { Text, Box } from 'rebass/styled-components';
import { Link, withRouter } from 'react-router-dom';

import * as firebase from 'firebase/app';

import { DASHBOARD, SIGN_UP } from '../../../constants/paths';
import InputGroup from '../../ui/InputGroup';
import InputField from '../../ui/InputField';
import InvisibleForm from '../../ui/InvisibleForm';
import SubmitButton from './SubmitButton';
import ErrorMessage from './ErrorMessage';

const LogIn = ({ history }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onLogIn = (event) => {
    event.preventDefault();
    setSubmitting(true);
    firebase.auth().signInWithEmailAndPassword(emailAddress, password)
      .then(() => {
        console.log('[LogIn] User authenticated, redirecting.');
        history.push(DASHBOARD);
      })
      .catch((error) => {
        console.error(error);
        setSubmitting(false);
        setErrorMessage(error.message);
      });
  };

  return (
    <>
      <InvisibleForm onSubmit={onLogIn}>
        <InputGroup mb={4}>
          <InputField
            label="Email Address"
            value={emailAddress}
            required
            type="email"
            onChange={(event) => setEmailAddress(event.target.value)}
          />
          <InputField
            label="Password"
            value={password}
            required
            type="password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </InputGroup>

        {errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
        <SubmitButton variant="primary" type="submit" submitting={submitting}>
          Log In
        </SubmitButton>
      </InvisibleForm>

      <Box mt={[4, 5]}>
        <Text color="textSecondary">
          {"Don't have an account yet? "}
          <Link to={SIGN_UP}>Sign up</Link>
        </Text>
      </Box>
    </>
  );
};

export default withRouter(LogIn);
