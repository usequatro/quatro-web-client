import React from 'react';
import { withRouter } from 'react-router-dom';
import * as firebase from 'firebase/app';
import { Box, Text } from 'rebass';
import { connect } from 'react-redux';

import FullScreenPaper from '../ui/FullScreenPaper';
import CloseButton from '../ui/CloseButton';
import Main from '../ui/Main';
import Button from '../ui/Button';
import { AppHeaderContainer, AppHeader } from '../ui/AppHeader';
import { resetLoadedTasks as resetLoadedTasksAction } from '../../modules/tasks';

import { LOG_IN } from '../../constants/paths';

const UserInfo = ({ label, children }) => (
  <Text mb={4} textAlign="left">
    {label}
    :
    {' '}
    {children}
  </Text>
);

const Account = ({ history, resetLoadedTasks }) => {
  const onSignOut = () => {
    resetLoadedTasks();
    firebase.auth().signOut()
      .then(() => {
        history.push(LOG_IN);
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const user = firebase.auth().currentUser;
  return (
    <FullScreenPaper>
      {onRequestClose => (
        <React.Fragment>
          <AppHeaderContainer>
            <AppHeader>
              Account
              <CloseButton onClick={onRequestClose} />
            </AppHeader>
          </AppHeaderContainer>
          <Main>
            <Box>
              <UserInfo label="Full name">{user.displayName}</UserInfo>
              <UserInfo label="Email">{user.email}</UserInfo>
              <UserInfo label="Email verified">{user.emailVerified ? 'yes' : 'no'}</UserInfo>
            </Box>
            <Button onClick={onSignOut}>Sign out</Button>
          </Main>
        </React.Fragment>
      )}
    </FullScreenPaper>
  );
};

const mapDispatchToProps = {
  resetLoadedTasks: resetLoadedTasksAction,
};

export default connect(null, mapDispatchToProps)(withRouter(Account));
