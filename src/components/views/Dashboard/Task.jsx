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
import ButtonFunction from '../../ui/ButtonFunction';
import BlockingTaskList from './BlockingTaskList';

const duration = 200;
const transitionStyles = {
  entering: {
    opacity: 0, maxHeight: '0', padding: '0 1.5rem',
  },
  entered: {
    opacity: 1, maxHeight: '10rem', padding: '1.5rem',
  },
  exiting: {
    opacity: 0, maxHeight: '0', padding: '0 1.5rem',
  },
  exited: {
    opacity: 0, maxHeight: '0', padding: '0 1.5rem',
  },
};

const TaskContainer = styled.div`
  display: flex;
  cursor: pointer;

  border-style: solid;
  border-color: ${props => props.theme.colors.border};
  border-width: 0 0 1px 0;

  opacity: ${props => transitionStyles[props.state].opacity};
  max-height: ${props => transitionStyles[props.state].maxHeight};
  padding: ${props => transitionStyles[props.state].padding};
  transition:
    opacity ${duration}ms ease-out,
    max-height ${duration}ms linear,
    padding ${duration}ms linear,
    background-color 250ms ease;

    background-color: ${props => props.theme.colors.appForeground};
    &:hover {
      background-color: ${props => props.theme.colors.appBackground};
    }
`;

const TaskTitle = props => <Heading {...props} as="h4" fontSize={2} mb={2} />;
const TaskSubtitle = props => <Text {...props} fontSize={2} mb={1} />;

const TaskButtons = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Task = ({
  id,
  title,
  showBlocked,
  scheduledStart,
  due,
  completed,
  completeTask,
  history,
  ranking,
  disableAnimations,
  prioritizedAheadOf,
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
    <Transition
      in={visible || disableAnimations}
      timeout={duration}
      onExited={onExited}
    >
      {state => (
        <TaskContainer
          onClick={onTaskClick}
          state={state}
          data-id={id}
          data-ahead-of={prioritizedAheadOf}
        >
          <Box flex={1}>
            <TaskTitle>
              <ButtonFunction>
                {ranking
                  ? `#${ranking}${prioritizedAheadOf ? '*' : ''} - ${title}`
                  : title
                }
              </ButtonFunction>
            </TaskTitle>
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
            {showBlocked && (
              <BlockingTaskList blockedTaskId={id} />
            )}
          </Box>
          <TaskButtons>
            {!completed && (
              <ButtonFunction>
                <CheckIcon onClick={onComplete} size="small" />
              </ButtonFunction>
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
