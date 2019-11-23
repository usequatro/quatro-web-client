import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { setRelativePrioritization } from 'modules/tasks';
import NOW_TASKS_LIMIT from 'constants/nowTasksLimit';
import { NOW, NEXT } from 'constants/dashboardTabs';

import TaskRefreshListener from 'components/views/Dashboard/TaskRefreshListener';
import NoTasksView from './NoTasksView';

const duration = 250;
const transitionStyles = {
  entering: { transform: null, opacity: 1 },
  entered: { transform: null, opacity: 1 },
  exiting: { transform: 'translateY(2rem)', opacity: 0 },
  exited: { transform: 'translateY(2rem)', opacity: 0 },
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

const EndOfListSpacing = styled.div`
  width: 100%;
  height: 2.5rem;
`;

const DraggableDiv = styled.div`
  display: flex;
`;

const TaskListWorkspace = ({
  taskListId, tasks, renderTask, noTasksMessage, isDragDisabled = false,
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
    }
  }, [dispatch, taskListId]);

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
                {tasks.length === 0 && (
                  <NoTasksView message={noTasksMessage} />
                )}
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

export default TaskListWorkspace;
