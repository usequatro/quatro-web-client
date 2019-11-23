import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Transition } from 'react-transition-group';
import { Box } from 'rebass/styled-components';
import { connect } from 'react-redux';

import HeadingResponsive from 'components/ui/HeadingResponsive';
import {
  selectUid,
  selectMessage,
  selectCallbackButton,
  selectType,
  runNotificationCallback as runNotificationCallbackAction,
  hideNotification as hideNotificationAction,
} from 'modules/notification';
import Button from 'components/ui/Button';
import RootPortal from 'components/ui/RootPortal';
import maxWidth from 'constants/maxWidth';
import dropShadow from 'components/style-mixins/dropShadow';

const duration = 125;
const transitionStyles = {
  entering: { transform: 'translateY(0)', opacity: 1 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(10rem)', opacity: 0 },
  exited: { transform: 'translateY(10rem)', opacity: 0 },
};

const NotificationContainer = styled(Box)`
  position: fixed;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  margin-bottom: 6rem;

  transform: ${(props) => transitionStyles[props.state].transform};
  opacity: ${(props) => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease, opacity ${duration}ms ease;
`;

const NotificationBox = styled(Box).attrs({ px: 4, py: 4 })`
  width: 90%;
  max-width: calc(${maxWidth} - 2rem);
  background-color: ${({ theme, notificationType }) => (
    (notificationType === 'error' && theme.colors.error)
    || theme.colors.appBackground
  )};
  display: flex;
  align-items: center;
  border-radius: 2rem;

  ${dropShadow(0.2)}
`;

const NotificationMessage = styled(HeadingResponsive).attrs({
  color: 'textPrimaryOverBackground',
})`
  flex-grow: 1;
`;

const Notification = ({
  uid, message, callbackButton, type, runNotificationCallback, hideNotification,
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
    <RootPortal>
      <Transition in={visible} timeout={duration} onExited={onExited}>
        {(state) => (
          <NotificationContainer state={state}>
            <NotificationBox onClick={onClickNotification} notificationType={type}>
              <NotificationMessage>
                {message}
              </NotificationMessage>
              {callbackButton && (
                <Box>
                  <Button variant="outlineOverBackground" onClick={onClickButton}>
                    {callbackButton}
                  </Button>
                </Box>
              )}
            </NotificationBox>
          </NotificationContainer>
        )}
      </Transition>
    </RootPortal>
  );
};

const mapStateToProps = (state) => ({
  uid: selectUid(state),
  message: selectMessage(state),
  callbackButton: selectCallbackButton(state),
  type: selectType(state),
});

const mapDispatchToProps = {
  runNotificationCallback: runNotificationCallbackAction,
  hideNotification: hideNotificationAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
