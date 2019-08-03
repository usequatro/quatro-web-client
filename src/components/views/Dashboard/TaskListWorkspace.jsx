import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import { setRelativePrioritization, clearRelativePrioritization } from '../../../modules/tasks';
import PortalAware from '../../ui/PortalAware';
import NoTasksView from './NoTasksView';

const duration = 125;
const transitionStyles = {
  entering: { transform: 'translateY(0)', opacity: 1 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(1rem)', opacity: 0.5 },
  exited: { transform: 'translateY(1rem)', opacity: 0.5 },
};

const WorkspaceArea = styled.div`
  width: 100%;
  min-height: calc(100% - 32px);

  transform: ${props => transitionStyles[props.state].transform};
  opacity: ${props => transitionStyles[props.state].opacity};
  transition: transform ${duration}ms ease-out, opacity ${duration}ms ease-out;
`;

const EndOfListSpacing = styled.div`
  width: 100%;
  height: 2.5rem;
`;

const TaskListWorkspace = ({
  taskListId, tasks, renderTask, noTasksMessage, /* , isDragDisabled = false, */
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);
  const dispatch = useDispatch();

  const onDragEnd = useCallback(({ draggableId, source, destination }) => {
    if (destination) {
      const realDestinationIndex = source.index < destination.index
        ? destination.index
        : destination.index + 1;
      const destinationTask = tasks[realDestinationIndex];
      if (destinationTask) {
        dispatch(setRelativePrioritization(draggableId, destinationTask.id));
      } else {
        dispatch(clearRelativePrioritization(draggableId));
      }
    }
  }, [dispatch, tasks]);

  return (
    <Transition in={visible} timeout={duration}>
      {state => (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={`droppable-${taskListId}`}>
            {droppableProvided /* , snapshot */ => (
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
                    isDragDisabled
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <PortalAware usePortal={draggableSnapshot.isDragging}>
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          {...draggableProvided.dragHandleProps}
                        >
                          {renderTask(task, index, draggableSnapshot.isDragging)}
                        </div>
                      </PortalAware>
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
        </DragDropContext>
      )}
    </Transition>
  );
};

export default TaskListWorkspace;
