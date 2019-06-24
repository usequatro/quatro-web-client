import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { Box, Text } from 'rebass';
import { connect } from 'react-redux';

import {
  selectUid,
  selectMessage,
  selectCallbackButton,
  runNotificationCallback as runNotificationCallbackAction,
  hideNotification as hideNotificationAction,
} from '../../modules/notification';
import Button from './Button';

const duration = 125;
const transitionStyles = {
  entering: { transform: 'translateY(0)', opacity: 1 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(1rem)', opacity: 0 },
  exited: { transform: 'translateY(1rem)', opacity: 0 },
};

const NotificationContainer = styled(Box)`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  transform: ${props => transitionStyles[props.state].transform};
  opacity: ${props => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease-out, opacity ${duration}ms ease-out;
`;

const NotificationBox = styled(Box).attrs({ px: 4, py: 4 })`
  width: 90%;
  background-color: ${props => props.theme.colors.appForeground};
  border: solid 1px ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
`;

const NotificationMessage = styled(Text)`
  flex-grow: 1;
`;

const Notification = ({
  uid, message, callbackButton, runNotificationCallback, hideNotification,
}) => {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!uid) {
      setVisible(false);
    } else if (uid && visible) {
      setVisible(false);
      setTimeout(() => setVisible(true), 100);
    } else {
      setRendered(true);
      setTimeout(() => setVisible(true), 20);
    }
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const onClickButton = (event) => {
    event.stopPropagation();
    runNotificationCallback(uid);
  };
  const onClickNotification = () => {
    hideNotification(uid);
  };
  const onExited = () => {
    setRendered(false);
  };

  if (!rendered) {
    return null;
  }

  return (
    <Transition in={visible} timeout={duration} onExited={onExited}>
      {state => (
        <NotificationContainer state={state}>
          <NotificationBox onClick={onClickNotification}>
            <NotificationMessage>{message}</NotificationMessage>
            {callbackButton && (
              <Box>
                <Button variant="outline" onClick={onClickButton}>
                  {callbackButton}
                </Button>
              </Box>
            )}
          </NotificationBox>
        </NotificationContainer>
      )}
    </Transition>
  );
};

const mapStateToProps = state => ({
  uid: selectUid(state),
  message: selectMessage(state),
  callbackButton: selectCallbackButton(state),
});

const mapDispatchToProps = {
  runNotificationCallback: runNotificationCallbackAction,
  hideNotification: hideNotificationAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
