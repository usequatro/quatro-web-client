import React, { useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import {
  Heading, Text, Box,
} from 'rebass';
import { Transition } from 'react-transition-group';
import {
  completeTask as completeTaskAction,
} from '../../../modules/tasks';
import { EDIT_TASK } from '../../../constants/paths';
import CheckIcon from '../../icons/CheckIcon';

const duration = 200;
const transitionStyles = {
  entering: {
    transform: 'scale(1, 1)', opacity: 1, maxHeight: 'none', padding: '1rem', margin: '1rem',
  },
  entered: {
    transform: 'scale(1, 1)', opacity: 1, maxHeight: '10rem', padding: '1rem', margin: '1rem',
  },
  exiting: {
    transform: 'scale(3, 3)', opacity: 0, maxHeight: '0', padding: '0', margin: '0',
  },
  exited: {
    transform: 'scale(3, 3)', opacity: 0, maxHeight: '0', padding: '0', margin: '0',
  },
};

const TaskContainer = styled(Box).attrs({})`
  border: solid 1px ${props => props.theme.colors.border};
  display: flex;

  transform: ${props => transitionStyles[props.state].transform};
  opacity: ${props => transitionStyles[props.state].opacity};
  max-height: ${props => transitionStyles[props.state].maxHeight};
  margin-bottom: ${props => transitionStyles[props.state].margin};
  padding: ${props => transitionStyles[props.state].padding};
  transition:
    transform ${duration / 2}ms ease-out,
    opacity ${duration / 2}ms ease-out,
    max-height ${duration}ms linear,
    padding ${duration}ms linear,
    margin-bottom ${duration}ms linear;
`;

const TaskTitle = props => <Heading {...props} as="h4" fontSize={2} mb={2} />;
const TaskSubtitle = props => <Text {...props} fontSize={2} mb={1} />;

const TaskButtons = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Task = ({
  id, title, score, scheduledStart, due, completed, completeTask, history,
}) => {
  const [visible, setVisible] = useState(true);

  const onComplete = (event) => {
    event.stopPropagation();
    setVisible(false);
  };
  const onExited = () => {
    completeTask(id);
  };
  const onTaskClick = () => {
    history.push(EDIT_TASK.replace(/:id\b/, id));
  };

  return (
    <Transition in={visible} timeout={duration} onExited={onExited}>
      {state => (
        <TaskContainer onClick={onTaskClick} state={state} data-id={id}>
          <Box flex={1}>
            <TaskTitle>{title}</TaskTitle>
            <TaskSubtitle>
              Tasket score:
              {' '}
              {score}
            </TaskSubtitle>
            {scheduledStart && (
            <TaskSubtitle mt={1}>
              Scheduled start:
              {' '}
              {new Date(scheduledStart).toLocaleString()}
            </TaskSubtitle>
            )}
            {due && (
            <TaskSubtitle mt={1}>
              Due:
              {' '}
              {new Date(due).toLocaleString()}
            </TaskSubtitle>
            )}
            {completed && (
            <TaskSubtitle mt={1}>
              Completed:
              {' '}
              {new Date(completed).toLocaleString()}
            </TaskSubtitle>
            )}
          </Box>
          <TaskButtons>
            {!completed && (
            <CheckIcon onClick={onComplete} size="small" />
            )}
          </TaskButtons>
        </TaskContainer>
      )}
    </Transition>
  );
};

const mapDispatchToProps = {
  completeTask: completeTaskAction,
};

export default withRouter(connect(null, mapDispatchToProps)(Task));
