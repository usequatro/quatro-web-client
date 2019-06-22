import React, { useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import Paper from './Paper';
import MAX_WIDTH from '../../constants/maxWidth';

const duration = 125;

const transitionStyles = {
  entering: { transform: 'translateY(0)' },
  entered: { transform: 'translateY(0)' },
  exiting: { transform: 'translateY(100%)' },
  exited: { transform: 'translateY(100%)' },
};

const PaperWithTransitionStyles = styled(Paper)`
  transform: ${props => transitionStyles[props.state].transform};
  transition: transform ${duration}ms ease-out;

  position: fixed;
  top: 0;
  left: calc(50% - ${MAX_WIDTH / 2}px);
  bottom: 0;
  z-index: 10;
  border: solid 1px ${props => props.theme.colors.border};

  max-width: ${MAX_WIDTH}px; /* only mobile width for now */
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
    <Transition in={visible} timeout={duration}>
      {state => (
        <PaperWithTransitionStyles {...props} state={state} pt={0}>
          {typeof children === 'function' ? children(close) : children}
        </PaperWithTransitionStyles>
      )}
    </Transition>
  );
};

export default withRouter(FullScreenPaper);
