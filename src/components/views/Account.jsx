import React from 'react';
import { withRouter } from 'react-router-dom';
import * as firebase from 'firebase/app';
import { Box, Heading, Text } from 'rebass';

import Paper from '../ui/Paper';
import CloseButton from '../ui/CloseButton';
import Main from '../ui/Main';
import Button from '../ui/Button';

import { LOG_IN } from '../../constants/paths';

const UserInfo = ({ label, children }) => (
  <Text mb={4} textAlign="left">
    {label}
    :
    {' '}
    {children}
  </Text>
);

const Account = ({ history }) => {
  const onSignOut = () => {
    firebase.auth().signOut()
      .then(() => {
        history.push(LOG_IN);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const onClose = () => {
    history.goBack();
  };
  const user = firebase.auth().currentUser;
  return (
    <Paper>
      <Box as="header" p={3} mb={4}>
        <Heading color="textHighlight" textAlign="center">
          Account
          <CloseButton onClick={onClose} />
        </Heading>
      </Box>
      <Main>
        <Box>
          <UserInfo label="Full name">{user.displayName}</UserInfo>
          <UserInfo label="Email">{user.email}</UserInfo>
          <UserInfo label="Email verified">{user.emailVerified ? 'yes' : 'no'}</UserInfo>
        </Box>
        <Button onClick={onSignOut}>Sign out</Button>
      </Main>
    </Paper>
  );
};

export default withRouter(Account);
