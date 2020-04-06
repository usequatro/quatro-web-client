import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { withRouter } from 'react-router-dom';

import { setRelativePrioritization } from 'modules/tasks';
import NOW_TASKS_LIMIT from 'constants/nowTasksLimit';
import {
  NOW,
  NEXT,
  SCHEDULED,
  BLOCKED,
  COMPLETED,
} from 'constants/dashboardTabs';
import { NEW_TASK } from 'constants/paths';

import HeadingResponsive from 'components/ui/HeadingResponsive';
import Button from 'components/ui/Button';
import TaskRefreshListener from 'components/views/Dashboard/TaskRefreshListener';

import withMixpanel from 'components/hoc/withMixpanel';
import { TASK_MANUALLY_ARRANGED } from 'constants/mixpanelTrackingEvents';

import NoTasksView from './NoTasksView';

const duration = 250;
const transitionStyles = {
  entering: { transform: null, opacity: 1 },
  entered: { transform: null, opacity: 1 },
  exiting: { transform: 'translateY(2rem)', opacity: 0 },
  exited: { transform: 'translateY(2rem)', opacity: 0 },
};

const TASK_LIST_ID_TO_EMPTY_STATE_IMG_MAP = {
  [NOW]: {
    img: '/empty-states/empty-state-top-four.png',
    message: 'What are the most important tasks you need to do right now?',
  },
  [NEXT]: {
    img: '/empty-states/empty-state-backlog.png',
    message: 'Nice! You have an empty backlog. Keep your focus on what\'s important.',
  },
  [SCHEDULED]: {
    img: '/empty-states/empty-state-calendar.png',
    message: '<p>All clear!</p><p>You don\'t have any scheduled followups, reminders, or tasks</p>',
  },
  [BLOCKED]: {
    img: '/empty-states/empty-state-blocked.png',
    message: '<p>The runway is clear!</p><p>You don\'t have any dependencies blocking your tasks.</p>',
  },
  [COMPLETED]: {
    img: '/empty-states/empty-state-completed.png',
    message: 'You haven\'t completed any tasks yet!',
  },
};

const WorkspaceArea = styled.div`
  width: 100%;
  min-height: calc(100% - 32px);

  /* conditionally using the transform CSS rule. Dnd doesn't like it, so that's why we clear it */
  ${(props) => transitionStyles[props.state].transform && (
    `transform: ${transitionStyles[props.state].transform};`
  )}

  opacity: ${(props) => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease-out, opacity ${duration}ms ease-out;
`;

const EmptyStateContainer = styled.div`
  width: 100%;
  min-height: calc(100% - 32px);
  padding: ${({ theme }) => `${theme.space[4]}`};
  display: flex;
  flex-direction: column;
`;

const EmptyStateImgContainer = styled.div`
  margin: ${({ theme }) => `${theme.space[1]} auto`};
  text-align: center;
`;

const EmptyStateImg = styled.img`
  width: 80%;
`;

const EmptyStateActionBtn = styled(Button)`
  border-radius: 2rem;
  width: 70%;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.space[3]} ${theme.space[4]}`};
  border-radius: ${({ theme }) => `${theme.space[4]}`};
  font-weight: bolder;
`;

const EmptyStateMessage = styled(HeadingResponsive).attrs({ fontSize: [3] })`
  color: ${({ theme }) => theme.colors.textSecondary};
  letter-spacing: ${({ theme }) => theme.letterSpacings.medium}
  text-align: center;
  line-height: 1.5rem;
  margin: ${({ theme }) => `0 ${theme.space[4]}`};
`

const EndOfListSpacing = styled.div`
  width: 100%;
  height: 2.5rem;
`;

const DraggableDiv = styled.div`
  display: flex;
`;

const TaskListWorkspace = ({
  history,
  mixpanel,
  taskListId,
  tasks,
  renderTask,
  isDragDisabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);
  const dispatch = useDispatch();

  const onDragEnd = useCallback(({ draggableId, source, destination }) => {
    if (destination) {
      const indexOffsets = {
        [NEXT]: () => NOW_TASKS_LIMIT,
        [NOW]: () => 0,
        default: () => { throw new Error('invalid type'); },
      };
      const offset = (indexOffsets[taskListId] || indexOffsets.default)();
      dispatch(
        setRelativePrioritization(
          draggableId,
          source.index + offset,
          destination.index + offset,
        ),
      );

      console.log('manual arranging');
      mixpanel.track(TASK_MANUALLY_ARRANGED, { taskId: draggableId });
    }
  }, [dispatch, taskListId]);

  if (!tasks.length && TASK_LIST_ID_TO_EMPTY_STATE_IMG_MAP[taskListId]) {
    return (
      <EmptyStateContainer>
        <EmptyStateMessage dangerouslySetInnerHTML={{__html: TASK_LIST_ID_TO_EMPTY_STATE_IMG_MAP[taskListId].message}}></EmptyStateMessage>
        <EmptyStateImgContainer>
          <EmptyStateImg src={TASK_LIST_ID_TO_EMPTY_STATE_IMG_MAP[taskListId].img} />
        </EmptyStateImgContainer>

        {taskListId === NOW &&
          <EmptyStateActionBtn variant="pill" onClick={() => history.push(NEW_TASK)}>
            Get Started!
          </EmptyStateActionBtn>
        }
      </EmptyStateContainer>
    );
  }

  return (
    <Transition in={visible} timeout={duration}>
      {(state) => (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`droppable-${taskListId}`}>
            {(droppableProvided) /* , snapshot */ => (
              <WorkspaceArea
                state={state}
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {tasks.map((task, index) => (
                  <Draggable
                    draggableId={task.id}
                    key={task.id}
                    index={index}
                    isDragDisabled={isDragDisabled}
                    disableInteractiveElementBlocking
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <DraggableDiv
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                      >
                        {renderTask(task, index, draggableSnapshot.isDragging)}
                      </DraggableDiv>
                    )}
                  </Draggable>
                ))}

                <EndOfListSpacing />
                {droppableProvided.placeholder /* for additional spacing when dragging */}
              </WorkspaceArea>
            )}
          </Droppable>

          <TaskRefreshListener />
        </DragDropContext>
      )}
    </Transition>
  );
};

export default withMixpanel(withRouter(TaskListWorkspace));
