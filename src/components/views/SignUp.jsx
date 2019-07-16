import React, { useState } from 'react';
import styled from 'styled-components';
import { Heading, Text } from 'rebass';
import { Link, withRouter } from 'react-router-dom';
import * as firebase from 'firebase/app';

import { DASHBOARD } from '../../constants/paths';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import InvisibleForm from '../ui/InvisibleForm';

export const SignUpHeading = styled(Heading).attrs(() => ({
  color: 'textHighlight',
}))`
  text-align: center;
  margin: 8vh 0 8vh 0;
`;

export const SignUpFormView = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 80%;
  max-width: 30rem;
`;

const SignUpFooterLinks = props => <Text color="textSecondary" {...props} />;

const SignUpFooterContainer = styled.footer`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  margin: 1rem 0 2rem 0;
`;

export const ScrollableDiv = styled.div`
  overflow-y: auto;
  height: 100%;
`;
export const Main = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
`;

export const SignUpFooter = () => (
  <SignUpFooterContainer>
    <SignUpFooterLinks><a href="/">Forgot password?</a></SignUpFooterLinks>
    <SignUpFooterLinks><a href="/">Support</a></SignUpFooterLinks>
  </SignUpFooterContainer>
);

const SignUp = ({ history }) => {
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const onSignUp = (event) => {
    event.preventDefault();
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html?authuser=0#create-user-with-email-and-password
    firebase.auth().createUserWithEmailAndPassword(emailAddress, password)
      .then(() => {
        console.log('[SignUp] User registered, updating information.');
        const user = firebase.auth().currentUser;
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
        setErrorMessage(error.message);
      });
  };

  return (
    <ScrollableDiv>
      <header>
        <SignUpHeading>
          Aizen
        </SignUpHeading>
      </header>
      <Main>
        <SignUpFormView>
          <InvisibleForm onSubmit={onSignUp}>
            <InputGroup mb={4}>
              <InputField
                placeholder="Full Name"
                required
                value={fullName}
                onChange={event => setFullName(event.target.value)}
              />
              <InputField
                placeholder="Email Address"
                required
                type="email"
                value={emailAddress}
                onChange={event => setEmailAddress(event.target.value)}
              />
              <InputField
                placeholder="Password"
                required
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
              <InputField
                placeholder="Confirm Password"
                required
                type="password"
              />
            </InputGroup>
            {errorMessage && (
              <p>{errorMessage}</p>
            )}
            <Button variant="primary" type="submit">Sign Up</Button>
          </InvisibleForm>
          <Text color="textSecondary" mt={4}>
            Already have an account?
            {' '}
            <Link to="/login">Log in</Link>
          </Text>
        </SignUpFormView>
      </Main>
      <SignUpFooter />
    </ScrollableDiv>
  );
};

export default withRouter(SignUp);
