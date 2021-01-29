import React, { useState, createContext, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { useDispatch } from 'react-redux';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { setRelativePrioritization } from '../../modules/tasks';

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

const DraggingState = createContext();

const isTaskDroppable = (droppableId) => /droppable-list-[0-9]+-.*/.test(droppableId);
const isMoveToBacklogDroppable = (droppableId) => /droppable-bottom-.*/.test(droppableId);
const isMoveToTop4Droppable = (droppableId) => /droppable-top-.*/.test(droppableId);
// const isCalendarDroppable = (droppableId) => /droppable-calendar*/.test(droppableId);

const getTaskDroppableOffset = (droppableId) =>
  parseInt(get(/droppable-[^-]+-([0-9]+)-.*/.exec(droppableId), 1, 0), 10);

const DashboardDragDropContext = ({
  // id,
  // enabled,
  // itemIds,
  // renderItem,
  // renderDropAreaStart,
  // renderDropAreaEnd,
  children,
  // dropAreaHeight,
  // indexOffset ,
}) => {
  const dispatch = useDispatch();

  const [dragging, setDragging] = useState(false);

  const onBeforeCapture = () => {
    setDragging(true);

    // If there's a drop area at the top, we add its height to scroll, so the dnd lib doesn't get
    // confused when calculating the relative position of the draggable to the cursor
    // if (renderDropAreaStart && dropAreaHeight) {
    //   window.scroll(0, window.scrollY + parseInt(dropAreaHeight, 10), 10);
    // }
  };

  const onDragEnd = ({ source, destination }) => {
    setDragging(false);

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
    } else {
      console.warn(`Unknown droppableId format: ${droppableId}`); // eslint-disable-line no-console
    }
  };

  const draggingState = useMemo(
    () => ({
      dragging,
    }),
    [dragging],
  );

  return (
    <DragDropContext onDragEnd={onDragEnd} onBeforeCapture={onBeforeCapture}>
      <DraggingState.Provider value={draggingState}>{children}</DraggingState.Provider>
    </DragDropContext>
  );
};

DashboardDragDropContext.propTypes = {
  // id: PropTypes.string.isRequired,
  // enabled: PropTypes.bool.isRequired,
  // dropAreaHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // itemIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  // renderItem: PropTypes.func.isRequired,
  // indexOffset: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

DashboardDragDropContext.defaultProps = {};

export default DashboardDragDropContext;

export const useDraggingState = () => useContext(DraggingState);
