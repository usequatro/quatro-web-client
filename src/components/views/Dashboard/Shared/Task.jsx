import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import truncate from 'lodash/truncate';
import isEmpty from 'lodash/isEmpty';
import {
  Heading, Text, Box,
} from 'rebass/styled-components';
import { Transition } from 'react-transition-group';

import { completeTask } from '../../../../modules/tasks';
import { EDIT_TASK } from '../../../../constants/paths';
import CheckIcon from '../../../icons/CheckIcon';
import ButtonFunction from '../../../ui/ButtonFunction';
import BlockingTaskList from './BlockingTaskList';
import activeLighter from '../../../style-mixins/activeLighter';
import { mediaVerySmall } from '../../../style-mixins/mediaQueries';
import { getRecurringOptionLabel } from '../../../../util/recurrence';

const duration = 300;
const maxHeightTransitionStyles = {
  entering: 'none',
  entered: 'none',
  exiting: '10rem',
  exited: '0',
};

const TaskContainer = styled.div`
  display: flex;
  width: calc(100% + 2px); /* two pix to account for borders that we want to hide on the side */

  border-style: solid;
  border-color: ${(props) => props.theme.colors.borderLight};
  border-width: ${({ state }) => (state === 'exited' ? '0' : '1px')};
  border-radius: 2rem;
  margin: 0 -1px 0 -1px; /* to hide side borders */
  background-color: ${(props) => props.theme.colors.appForeground};

  background-image: ${({ theme }) => (
    `linear-gradient(30deg, ${theme.colors.appBackground} 49%, ${theme.colors.appForeground} 50%)`
  )};
  background-size: 300% 100%;

  padding-left: 0;
  padding-right: ${({ theme }) => theme.space[4]};
  ${mediaVerySmall} {
    padding-right: ${({ theme }) => theme.space[3]};
  }

  overflow: hidden;

  background-position: ${({ state }) => (state === 'exited' || state === 'exiting' ? '0% 0%' : '100% 0%')};
  opacity: ${({ state }) => (state === 'exited' ? '0' : '1')};
  padding-top: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[5])};
  padding-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[5])};
  ${mediaVerySmall} {
    padding-top: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[3])};
    padding-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[3])};
  }
  margin-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[3])};
  ${mediaVerySmall} {
    margin-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[2])};
  }
  max-height: ${({ state }) => maxHeightTransitionStyles[state]};
  transition:
    background-position ${duration}ms linear,
    opacity ${duration}ms ease-out,
    padding-top ${duration}ms ease-out,
    padding-bottom ${duration}ms ease-out,
    margin-bottom ${duration}ms ease-out,
    max-height ${duration}ms ease-out;

  cursor: auto; /* overriding draggable that makes drag cursor */

  &:hover {
    background-image: ${({ theme }) => (
    `linear-gradient(30deg, ${theme.colors.appBackground} 49%, ${theme.colors.foregroundOptionHover} 50%)`
  )};
  }
  ${activeLighter}
`;

const TextForParagraphs = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TaskTitle = (props) => <Heading {...props} as="h4" fontSize={[3, 4]} mb={2} />;
const TaskSubtitle = (props) => <TextForParagraphs {...props} fontSize={[2, 4]} mb={1} color="textSecondary" />;

const TaskButtons = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-shrink: 0;
`;

const CompleteButton = styled(ButtonFunction)`
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
  ${activeLighter}
`;

const DragHandle = styled.div`
  width: ${({ theme }) => theme.space[4]};
  min-height: ${({ theme }) => theme.space[4]};
  flex-shrink: 0;
  ${mediaVerySmall} {
    width: ${({ theme }) => theme.space[3]};
    min-height: ${({ theme }) => theme.space[3]};
  }
  cursor: ${(props) => (props.enableDragHint ? 'grab' : 'inherit')};
`;
const MainContainer = styled(Box)`
  flex-grow: 1;
  overflow: hidden;
`;

const Task = ({
  id,
  title,
  description,
  showBlocked,
  enableDragHint = false,
  allowComplete = true,
  scheduledStart,
  due,
  completed,
  history,
  ranking,
  disableAnimations,
  prioritizedAheadOf,
  recurringConfig,
}) => {
  const dispatch = useDispatch();
  const [completedStart, setCompletedStart] = useState(false);

  const onComplete = (event) => {
    event.stopPropagation();
    setCompletedStart(true);
  };
  const onExited = () => {
    dispatch(completeTask(id));
  };
  const onTaskClick = () => {
    history.push(EDIT_TASK.replace(/:id\b/, id));
  };

  const recurringLabel = !isEmpty(recurringConfig)
    ? getRecurringOptionLabel(recurringConfig)
    : null;

  return (
    <Transition
      in={!completedStart || disableAnimations}
      timeout={duration}
      onExited={() => setTimeout(onExited, duration)}
    >
      {(state) => (
        <TaskContainer
          onClick={onTaskClick}
          state={state}
          data-id={id}
          data-ahead-of={prioritizedAheadOf}
        >
          <DragHandle enableDragHint={enableDragHint} />
          <MainContainer>
            {/* <TaskTitle>{id}</TaskTitle> */}
            <TaskTitle>
              <ButtonFunction variant="text">
                {ranking
                  ? `# ${ranking}${prioritizedAheadOf ? '*' : ''}  -  ${title}`
                  : title}
              </ButtonFunction>
            </TaskTitle>
            {scheduledStart && (
              <TaskSubtitle mt={2}>
                {`Scheduled start: ${new Date(scheduledStart).toLocaleString()}`}
              </TaskSubtitle>
            )}
            {due && (
              <TaskSubtitle mt={2}>
                {`Due: ${new Date(due).toLocaleString()}`}
              </TaskSubtitle>
            )}
            {recurringLabel && (
              <TaskSubtitle mt={2}>
                {`Recurring: ${recurringLabel}`}
              </TaskSubtitle>
            )}
            {description && (
              <TaskSubtitle mt={2}>
                {truncate(description, { separator: ' ', length: 200 })}
              </TaskSubtitle>
            )}
            {completed && (
              <TaskSubtitle mt={2}>
                {`Completed: ${new Date(completed).toLocaleString()}`}
              </TaskSubtitle>
            )}
            {showBlocked && (
              <BlockingTaskList taskId={id} />
            )}
          </MainContainer>
          <TaskButtons>
            {!completed && allowComplete && (
              <CompleteButton variant="text">
                <CheckIcon onClick={onComplete} size="small" title="Mark as Completed" />
              </CompleteButton>
            )}
          </TaskButtons>
        </TaskContainer>
      )}
    </Transition>
  );
};

export default withRouter(Task);
