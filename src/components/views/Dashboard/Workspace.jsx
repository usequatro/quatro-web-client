import React, { useState, useEffect } from 'react';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { Box } from 'rebass';

const duration = 125;
const transitionStyles = {
  entering: { transform: 'translateY(0)', opacity: 1 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(1rem)', opacity: 0.5 },
  exited: { transform: 'translateY(1rem)', opacity: 0.5 },
};

const WorkspaceArea = styled(Box).attrs({
  mx: 2,
  my: 3,
  px: 2,
  py: 3,
  bg: 'appForeground',
})`
  width: calc(100% - 2rem);
  min-height: calc(100% - 32px);

  transform: ${props => transitionStyles[props.state].transform};
  opacity: ${props => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease-out, opacity ${duration}ms ease-out;
`;

const Workspace = (props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <Transition in={visible} timeout={duration}>
      {state => (
        <WorkspaceArea {...props} state={state} />
      )}
    </Transition>
  );
};

export default Workspace;
