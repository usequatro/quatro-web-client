import React, { useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Box } from 'rebass';
import MAX_WIDTH from '../../constants/maxWidth';
import RootPortal from './RootPortal';

const duration = 125;

const transitionStyles = {
  entering: { transform: 'translateY(0)' },
  entered: { transform: 'translateY(0)' },
  exiting: { transform: 'translateY(100%)' },
  exited: { transform: 'translateY(100%)' },
};

const PaperWithTransitionStyles = styled(Box).attrs({ bg: 'appForeground' })`
  transform: ${props => transitionStyles[props.state].transform};
  transition: transform ${duration}ms ease-out;

  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 10;
  border: solid 1px ${props => props.theme.colors.border};
`;

const WidthContainer = styled(Box)`
  max-width: ${MAX_WIDTH}px;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FullScreenPaper = ({ history, children, ...props }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(() => history && history.goBack(), duration);
  };

  return (
    <RootPortal>
      <Transition in={visible} timeout={duration}>
        {state => (
          <PaperWithTransitionStyles {...props} state={state} pt={0}>
            <WidthContainer>
              {typeof children === 'function' ? children(close) : children}
            </WidthContainer>
          </PaperWithTransitionStyles>
        )}
      </Transition>
    </RootPortal>
  );
};

export default withRouter(FullScreenPaper);
