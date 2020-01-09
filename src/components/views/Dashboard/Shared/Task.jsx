import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import truncate from 'lodash/truncate';
import memoize from 'lodash/memoize';
import {
  Heading, Text, Box,
} from 'rebass/styled-components';
import { Transition } from 'react-transition-group';

import { completeTask, selectRecurringConfig } from 'modules/tasks';
import { EDIT_TASK } from 'constants/paths';
import { getRecurringOptionLabel } from 'util/recurrence';

import CheckIcon from 'components/icons/CheckIcon';
import BlockingTaskList from './BlockingTaskList';
import activeLighter from 'components/style-mixins/activeLighter';
import { mediaVerySmall } from 'components/style-mixins/mediaQueries';

import ButtonFunction from 'components/ui/ButtonFunction';

const MAX_DESCRIPTION_CHARACTERS = 200;

const duration = 300;
const maxHeightTransitionStyles = {
  entering: 'none',
  entered: 'none',
  exiting: '10rem',
  exited: '0',
};

const TaskContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 0 1rem;
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
  padding-top: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[3])};
  padding-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[3])};
  ${mediaVerySmall} {
    padding-top: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[2])};
    padding-bottom: ${({ state, theme }) => (state === 'exited' ? '0' : theme.space[2])};
  }
  
  max-height: ${({ state }) => maxHeightTransitionStyles[state]};
  transition:
    background-position ${duration}ms linear,
    opacity ${duration}ms ease-out,
    padding-top ${duration}ms ease-out,
    padding-bottom ${duration}ms ease-out,
    margin-bottom ${duration}ms ease-out,
    max-height ${duration}ms ease-out;

  cursor: pointer; /* overriding draggable that makes drag cursor */

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
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  letter-spacing: ${({ theme }) => theme.letterSpacings.small};
`;

const TextForTitle = styled(Text)`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes[3]};
  letter-spacing: ${({ theme }) => theme.letterSpacings.medium};
  margin-bottom: ${({ theme }) => theme.space[2]};
  line-height: 1.5rem;
`;

const TaskTitle = (props) => <TextForTitle {...props} as="h4" fontSize={[3, 4]} mb={3} />;
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
  flex-shrink: 0;
  cursor: ${(props) => (props.enableDragHint ? 'grab' : 'inherit')};
`;

const MainContainer = styled(Box)`
  flex-grow: 1;
  overflow: hidden;
  padding: ${({ theme }) => `0 ${theme.space[3]}`};
`;

const RankContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.appBackground};
  color: ${({ theme }) => theme.colors.textPrimaryOverBackground};
  margin-right: ${({ theme }) => theme.space[2]};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  text-align: center;
  width: 1.5rem;
  height: 1.5rem;
  line-height: 1.5rem;
  border-radius: 100%;
  flex-shrink: 0;
`;

const stopPropagation = (event) => event.stopPropagation();

/**
 *
 * @param {string} text
 * @return {React[]}
 */
const addLinkTags = memoize((text) => {
  const tmp = '|+|-|+|';
  const pieces = text.replace(/(https?:\/\/[^\s]+)/ig, `${tmp}$1${tmp}`).split(tmp);

  let remainingLength = MAX_DESCRIPTION_CHARACTERS;

  return pieces.map((piece, index) => {
    if (remainingLength <= 0) {
      return null;
    }
    const truncatedPiece = truncate(piece, { separator: ' ', length: remainingLength });
    remainingLength -= truncatedPiece.length;

    const isLink = index % 2 === 1;

    /* eslint-disable react/no-array-index-key */
    return isLink
      ? <a href={piece} target="_blank" rel="noopener noreferrer" key={index} onClick={stopPropagation}>{truncatedPiece}</a>
      : <React.Fragment key={index}>{truncatedPiece}</React.Fragment>;
    /* eslint-enable react/no-array-index-key */
  })
    .filter(Boolean);
});

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
  recurringConfigId,
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

  const recurringConfig = useSelector((state) => selectRecurringConfig(state, recurringConfigId));
  const recurringLabel = recurringConfigId && recurringConfig
    ? getRecurringOptionLabel(recurringConfig)
    : '';

  const rankNumber = ranking
    ? `${ranking}${prioritizedAheadOf ? '*' : ''}`
    : false;

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
          {rankNumber &&
            <RankContainer>
              {rankNumber}
            </RankContainer>
          }
          <MainContainer>
            {/* <TaskTitle>{id}</TaskTitle> */}
            <TaskTitle>
              {/* <ButtonFunction variant="text"> */}
              {title}
              {/* {ranking
                  ? `# ${ranking}${prioritizedAheadOf ? '*' : ''}  -  ${title}`
                  : title} */}
              {/* </ButtonFunction> */}
            </TaskTitle>
            {scheduledStart && (
              <TaskSubtitle mt={2}>
                {`Scheduled start: ${new Date(scheduledStart).toLocaleString()}`}
              </TaskSubtitle>
            )}
            {due && (
              <TaskSubtitle mt={2}>
                {`Due by: ${new Date(due).toLocaleString()}`}
              </TaskSubtitle>
            )}
            {recurringLabel && (
              <TaskSubtitle mt={2}>
                {`Recurrence: ${recurringLabel}`}
              </TaskSubtitle>
            )}
            {/* {description && (
              <TaskSubtitle mt={2}>
                {addLinkTags(description)}
              </TaskSubtitle>
            )} */}
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
