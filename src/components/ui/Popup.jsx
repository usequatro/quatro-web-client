import React, { useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';

import RootPortal from './RootPortal';
import dropShadow from '../style-mixins/dropShadow';
import ButtonInline from './ButtonInline';

const duration = 125;

const transitionStyles = {
  entering: { transform: 'translateY(100%)', opacity: 0 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(100%)', opacity: 0 },
  exited: { transform: 'translateY(100%)', opacity: 0 },
};

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 20;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.2);
  opacity: ${(props) => transitionStyles[props.state].opacity};
  transition: opacity ${duration}ms ease;
`;
const PopupContainer = styled(Box).attrs({ bg: 'appForeground' })`
  transform: ${(props) => transitionStyles[props.state].transform};
  opacity: ${(props) => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease-out, opacity ${duration}ms ease;

  width: 90%;
  max-width: 30rem;
  min-height: 30vh;
  max-height: 30rem;

  display: flex;
  flex-direction: column;
  border-radius: 4px;
  ${dropShadow}
`;

const Popup = ({ open, onClose, children }) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    setVisible(open);
  }, [open]);

  const close = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setVisible(false);
    setTimeout(() => onClose(), duration);
  };

  return (
    <RootPortal>
      <Transition appear unmountOnExit mountOnEnter in={visible} timeout={duration}>
        {(state) => (
          <Background state={state}>
            <PopupContainer state={state} p={4}>
              {typeof children === 'function' ? children(close) : children}
            </PopupContainer>
          </Background>
        )}
      </Transition>
    </RootPortal>
  );
};

Popup.Header = styled(Box)`
  display: flex;
  justify-content: flex-start;
  flex-shrink: 0;
`;
Popup.Content = styled(Box).attrs({ py: 4 })`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
Popup.Footer = styled(Box)`
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;

  > ${ButtonInline} {
    padding-left: 2rem;
  }
`;

export default Popup;
