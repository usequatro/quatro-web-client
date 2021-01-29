import React from 'react';
import PropTypes from 'prop-types';
// import cond from 'lodash/cond';
// import { useDispatch } from 'react-redux';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import Paper from '@material-ui/core/Paper';

import { useDraggingState } from '../DashboardDragDropContext';

// import { setRelativePrioritization } from '../../../modules/tasks';

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

const Sortable = ({
  id,
  enabled,
  itemIds,
  renderItem,
  renderDropAreaStart,
  renderDropAreaEnd,
  // dropAreaHeight,
  indexOffset,
}) => {
  // const dispatch = useDispatch();

  // const [dragging, setDragging] = useState(false);

  // const onBeforeCapture = () => {
  //   setDragging(true);

  //   // If there's a drop area at the top, we add its height to scroll, so the dnd lib doesn't get
  //   // confused when calculating the relative position of the draggable to the cursor
  //   if (renderDropAreaStart && dropAreaHeight) {
  //     window.scroll(0, window.scrollY + parseInt(dropAreaHeight, 10), 10);
  //   }
  // };

  // const onDragEnd = ({ source, destination }) => {
  //   setDragging(false);

  //   // If there's a drop area at the top, remove the previous increase on scroll so it doesn't bump
  //   // when releasing
  //   if (renderDropAreaStart && dropAreaHeight) {
  //     window.scroll(0, window.scrollY - parseInt(dropAreaHeight, 10), 10);
  //   }

  //   // dropped outside the list
  //   if (!destination) {
  //     return;
  //   }

  //   const destinationIndex = cond([
  //     [() => /-top$/.test(destination.droppableId), () => -1],
  //     [() => /-bottom$/.test(destination.droppableId), () => itemIds.length + 1],
  //     [
  //       () => true,
  //       () => (source.index < destination.index ? destination.index + 1 : destination.index),
  //     ],
  //   ])();

  //   dispatch(setRelativePrioritization(source.index + indexOffset, destinationIndex + indexOffset));
  // };

  const { dragging } = useDraggingState();

  return (
    <>
      {dragging && renderDropAreaStart && (
        <DropArea droppableId={`droppable-top-${indexOffset}-${id}`} render={renderDropAreaStart} />
      )}

      <Droppable droppableId={`droppable-list-${indexOffset}-${id}`}>
        {(droppableProvided) => (
          <div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef}>
            {itemIds.map((itemId, index) => (
              <Draggable
                key={itemId}
                draggableId={`draggable-${id}-${itemId}`}
                index={index}
                isDragDisabled={!enabled}
              >
                {(draggableProvided, draggableSnapshot) => (
                  <Paper
                    ref={draggableProvided.innerRef}
                    square
                    {...draggableProvided.draggableProps}
                    {...draggableProvided.dragHandleProps}
                    elevation={draggableSnapshot.isDragging ? 4 : 0}
                    style={draggableProvided.draggableProps.style}
                  >
                    {renderItem(itemId, index)}
                  </Paper>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>

      {dragging && renderDropAreaEnd && (
        <DropArea
          droppableId={`droppable-bottom-${indexOffset}-${id}`}
          render={renderDropAreaEnd}
        />
      )}
    </>
  );
};

Sortable.propTypes = {
  id: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  dropAreaHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  itemIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  renderItem: PropTypes.func.isRequired,
  indexOffset: PropTypes.number.isRequired,
  renderDropAreaStart: PropTypes.func,
  renderDropAreaEnd: PropTypes.func,
};

Sortable.defaultProps = {
  renderDropAreaStart: undefined,
  renderDropAreaEnd: undefined,
};

export default Sortable;
