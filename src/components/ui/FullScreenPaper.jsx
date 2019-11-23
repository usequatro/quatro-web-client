import React, { useState } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Box } from 'rebass/styled-components';
import Div100vh from 'react-div-100vh';
import MAX_WIDTH from 'constants/maxWidth';
import RootPortal from 'components/ui/RootPortal';

const duration = 125;

const transitionStyles = {
  entering: { transform: 'translateY(100%)' },
  entered: { transform: 'translateY(0)' },
  exiting: { transform: 'translateY(100%)' },
  exited: { transform: 'translateY(100%)' },
};

const PaperWithTransitionStyles = styled(Box).attrs({ bg: 'appForeground' })`
  transform: ${(props) => transitionStyles[props.state].transform};
  transition: transform ${duration}ms ease-out;

  display: flex;
  justify-content: center;

  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
`;

const FullScreenPaper = ({
  history, onCloseCustom, children, ...props
}) => {
  const [visible, setVisible] = useState(true);

  const close = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setVisible(false);
    setTimeout(() => (
      onCloseCustom ? onCloseCustom(history) : history.goBack()
    ), duration);
  };

  return (
    <RootPortal>
      <Transition appear in={visible} timeout={duration}>
        {(state) => (
          <PaperWithTransitionStyles {...props} state={state} pt={0}>
            <Div100vh style={{ height: '100rvh', width: '100%', maxWidth: MAX_WIDTH }}>
              {typeof children === 'function' ? children(close) : children}
            </Div100vh>
          </PaperWithTransitionStyles>
        )}
      </Transition>
    </RootPortal>
  );
};

export default withRouter(FullScreenPaper);
