import React from 'react';
import styled from 'styled-components';
import { Heading, Text } from 'rebass';
import { Link } from 'react-router-dom';
import InputGroup from '../ui/InputGroup';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Main from '../ui/Main';

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

  > * {
    margin-bottom: 3rem;
  }
`;

const SignUpFooterLinks = props => <Text color="textSecondary" {...props} />;

const SignUpFooterContainer = styled.footer`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  width: 100%;
  margin: 4vh 0 8vh 0;
`;

export const SignUpFooter = () => (
  <SignUpFooterContainer>
    <SignUpFooterLinks><a href="/">Forgot password?</a></SignUpFooterLinks>
    <SignUpFooterLinks><a href="/">Support</a></SignUpFooterLinks>
  </SignUpFooterContainer>
);

export default () => (
  <React.Fragment>
    <header>
      <SignUpHeading>
        Tasket
      </SignUpHeading>
    </header>
    <Main>
      <SignUpFormView>
        <InputGroup>
          <InputField placeholder="Full Name" />
          <InputField placeholder="Email Address" />
          <InputField placeholder="Password" />
          <InputField placeholder="Confirm Password" />
        </InputGroup>
        <Button variant="primary">Sign Up</Button>
        <Text color="textSecondary">
          Already have an account?
          {' '}
          <Link to="/login">Log in</Link>
        </Text>
      </SignUpFormView>
    </Main>
    <SignUpFooter />
  </React.Fragment>
);
