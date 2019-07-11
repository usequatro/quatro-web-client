import React, { useState } from 'react';
import { Text } from 'rebass';
import { Link, withRouter } from 'react-router-dom';

import * as firebase from 'firebase/app';

import { DASHBOARD } from '../../constants/paths';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import {
  SignUpHeading, SignUpFooter, SignUpFormView, Main, ScrollableDiv,
} from './SignUp';
import InvisibleForm from '../ui/InvisibleForm';

const LogIn = ({ history }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const onLogIn = (event) => {
    event.preventDefault();
    firebase.auth().signInWithEmailAndPassword(emailAddress, password)
      .then(() => {
        console.log('[LogIn] User authenticated, redirecting.');
        history.push(DASHBOARD);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage(error.message);
      });
  };

  return (
    <ScrollableDiv>
      <header>
        <SignUpHeading>
          Tasket
        </SignUpHeading>
      </header>
      <Main>
        <SignUpFormView>
          <InvisibleForm onSubmit={onLogIn}>
            <InputGroup mb={4}>
              <InputField
                placeholder="Email Address"
                value={emailAddress}
                required
                type="email"
                onChange={event => setEmailAddress(event.target.value)}
              />
              <InputField
                placeholder="Password"
                value={password}
                required
                type="password"
                onChange={event => setPassword(event.target.value)}
              />
            </InputGroup>
            {errorMessage && (
              <p>{errorMessage}</p>
            )}
            <Button variant="primary" type="submit">Log In</Button>
          </InvisibleForm>
          <Text color="textSecondary" mt={4}>
            {"Don't have an account yet? "}
            <Link to="/signup">Sign up</Link>
          </Text>
        </SignUpFormView>
      </Main>
      <SignUpFooter />
    </ScrollableDiv>
  );
};

export default withRouter(LogIn);
