import React, { useState } from 'react';
import { Text } from 'rebass';
import { Link, withRouter } from 'react-router-dom';

import * as firebase from 'firebase/app';

import { DASHBOARD } from '../../constants/paths';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import Main from '../ui/Main';
import Button from '../ui/Button';
import {
  SignUpHeading, SignUpFooter, SignUpFormView,
} from './SignUp';

const LogIn = ({ history }) => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const onLogIn = () => {
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
    <React.Fragment>
      <header>
        <SignUpHeading>
          Tasket
        </SignUpHeading>
      </header>
      <Main>
        <SignUpFormView>
          <InputGroup>
            <InputField
              placeholder="Email Address"
              value={emailAddress}
              onChange={event => setEmailAddress(event.target.value)}
            />
            <InputField
              placeholder="Password"
              value={password}
              onChange={event => setPassword(event.target.value)}
            />
          </InputGroup>
          {errorMessage && (
            <p>{errorMessage}</p>
          )}
          <Button variant="primary" onClick={onLogIn}>Log In</Button>
          <Text color="textSecondary">
            {"Don't have an account yet? "}
            <Link to="/signup">Sign up</Link>
          </Text>
        </SignUpFormView>
      </Main>
      <SignUpFooter />
    </React.Fragment>
  );
};

export default withRouter(LogIn);
