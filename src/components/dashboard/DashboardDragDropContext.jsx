import React, { useState, createContext, useMemo, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import addMinutes from 'date-fns/addMinutes';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { setRelativePrioritization, blockCalendarEventForTask } from '../../modules/tasks';
import { selectCalendarDisplayTimestamp } from '../../modules/dashboard';
import NOW_TASKS_LIMIT from '../../constants/nowTasksLimit';

const DropArea = ({ droppableId, render }) => (
  <Droppable droppableId={droppableId}>
    {(droppableProvided, droppableSnapshot) => (
      <div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
        {render(droppableSnapshot.isDraggingOver)}

        {/* placeholder, although we never want to show it, so force it hidden */}
        <div style={{ display: 'none' }}>{droppableProvided.placeholder}</div>
      </div>
    )}
  </Droppable>
);

DropArea.propTypes = {
  droppableId: PropTypes.string.isRequired,
  render: PropTypes.func.isRequired,
};

const AppDragDropContext = createContext({});

const isTaskDroppable = (droppableId) => /droppable-list-[0-9]+-.*/.test(droppableId);
const isMoveToBacklogDroppable = (droppableId) => /droppable-bottom-.*/.test(droppableId);
const isMoveToTop4Droppable = (droppableId) => /droppable-top-.*/.test(droppableId);
const isCalendarDroppable = (droppableId) => droppableId === 'droppable-calendar';

const getTaskIdFromDraggableId = (draggableId) =>
  get(/draggable-([^-]+)-([^-]+)$/.exec(draggableId), 2);

const getTaskDroppableOffset = (droppableId) =>
  parseInt(get(/droppable-[^-]+-([0-9]+)-.*/.exec(droppableId), 1, 0), 10);

const DashboardDragDropContext = ({ children }) => {
  const dispatch = useDispatch();

  const [activeDraggableId, setActiveDraggableId] = useState(null);

  const calendarDisplayTimestamp = useSelector(selectCalendarDisplayTimestamp);

  const getCalendarDragPlaceholderPositionRef = useRef(() => {
    console.warn('getCalendarDragPlaceholderPositionRef not set'); // eslint-disable-line no-console
  });

  const onBeforeCapture = ({ draggableId }) => {
    setActiveDraggableId(draggableId);
  };

  const onDragEnd = ({ draggableId, source, destination }) => {
    setActiveDraggableId(null);

    // dropped outside the list
    if (!destination) {
      return;
    }

    const { droppableId, index } = destination;

    if (isTaskDroppable(droppableId)) {
      const destinationIndex = source.index < index ? index + 1 : index;
      const indexOffset = getTaskDroppableOffset(droppableId);
      dispatch(
        setRelativePrioritization(source.index + indexOffset, destinationIndex + indexOffset),
      );
    } else if (isMoveToBacklogDroppable(droppableId)) {
      const indexOffset = getTaskDroppableOffset(droppableId);
      dispatch(setRelativePrioritization(source.index + indexOffset, NOW_TASKS_LIMIT + 1));
    } else if (isMoveToTop4Droppable(droppableId)) {
      const indexOffset = getTaskDroppableOffset(droppableId);
      dispatch(setRelativePrioritization(source.index + indexOffset, NOW_TASKS_LIMIT - 1));
    } else if (isCalendarDroppable(droppableId)) {
      const taskId = getTaskIdFromDraggableId(draggableId);

      const placeholderPosition = getCalendarDragPlaceholderPositionRef.current();
      const calendarBlockStart = addMinutes(
        calendarDisplayTimestamp, // this date is expected to be startOfDay
        placeholderPosition.minutes,
      ).getTime();
      dispatch(blockCalendarEventForTask(taskId, calendarBlockStart));
    } else {
      console.warn(`Unknown droppableId format: ${droppableId}`); // eslint-disable-line no-console
    }
  };

  const contextState = useMemo(
    () => ({
      dragging: Boolean(activeDraggableId),
      draggableTaskId: getTaskIdFromDraggableId(activeDraggableId),
      getCalendarDragPlaceholderPositionRef,
    }),
    [activeDraggableId],
  );

  return (
    <DragDropContext onBeforeCapture={onBeforeCapture} onDragEnd={onDragEnd}>
      <AppDragDropContext.Provider value={contextState}>{children}</AppDragDropContext.Provider>
    </DragDropContext>
  );
};

DashboardDragDropContext.propTypes = {
  children: PropTypes.node.isRequired,
};

DashboardDragDropContext.defaultProps = {};

export default DashboardDragDropContext;

export const useAppDragDropContext = () => useContext(AppDragDropContext);
