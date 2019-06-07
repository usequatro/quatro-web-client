import React from 'react';
import { Text } from 'rebass';
import { Link } from 'react-router-dom';
import InputGroup from '../ui/InputGroup';
import Input from '../ui/Input';
import Main from '../ui/Main';
import Button from '../ui/Button';
import {
  SignUpHeading, SignUpFooter, SignUpFormView,
} from './SignUp';

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
          <Input placeholder="Email Address" />
          <Input placeholder="Password" />
        </InputGroup>
        <Button variant="primary">Log In</Button>
        <Text color="textSecondary">
          {"Don't have an account yet? "}
          <Link to="/signup">Sign up</Link>
        </Text>
      </SignUpFormView>
    </Main>
    <SignUpFooter />
  </React.Fragment>
);
