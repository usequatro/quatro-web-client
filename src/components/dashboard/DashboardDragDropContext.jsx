import React, { useState, createContext, useMemo, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import set from 'date-fns/set';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { setRelativePrioritization, timeboxTask } from '../../modules/tasks';
import { selectCalendarDisplayTimestamp } from '../../modules/dashboard';

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

const getTaskIdFromDraggableId = (draggableId) => get(/draggable-.*-([^-]+)$/.exec(draggableId), 1);

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

    // If there's a drop area at the top, we add its height to scroll, so the dnd lib doesn't get
    // confused when calculating the relative position of the draggable to the cursor
    // const sourceDroppableId = source.droppableId;
    // if (renderDropAreaStart && dropAreaHeight) {
    //   window.scroll(0, window.scrollY + parseInt(dropAreaHeight, 10), 10);
    // }
  };

  const onDragEnd = ({ draggableId, source, destination }) => {
    setActiveDraggableId(null);

    // If there's a drop area at the top, remove the previous increase on scroll so it doesn't bump
    // when releasing
    // if (renderDropAreaStart && dropAreaHeight) {
    //   window.scroll(0, window.scrollY - parseInt(dropAreaHeight, 10), 10);
    // }

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
      dispatch(setRelativePrioritization(source.index + indexOffset, 5)); // @todo: dehardcode
    } else if (isMoveToTop4Droppable(droppableId)) {
      const indexOffset = getTaskDroppableOffset(droppableId);
      dispatch(setRelativePrioritization(source.index + indexOffset, 3)); // @todo: dehardcode
    } else if (isCalendarDroppable(droppableId)) {
      const taskId = getTaskIdFromDraggableId(draggableId);

      const placeholderPosition = getCalendarDragPlaceholderPositionRef.current();
      const calendarBlockStart = set(calendarDisplayTimestamp, {
        minutes: placeholderPosition.minutes,
      }).getTime();
      dispatch(timeboxTask(taskId, calendarBlockStart));
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
