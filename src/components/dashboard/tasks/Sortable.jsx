import React from 'react';
import PropTypes from 'prop-types';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import Paper from '@material-ui/core/Paper';

import { useAppDragDropContext } from '../DashboardDragDropContext';

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
  indexOffset,
}) => {
  const { dragging } = useAppDragDropContext();

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
                    style={{
                      ...draggableProvided.draggableProps.style,
                      opacity: draggableSnapshot.draggingOver === 'droppable-calendar' ? 0.5 : 1,
                      // Removing the drop animation on the calendar bc its delay allows users to
                      // move the placeholder away from where it was
                      // @link https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/drop-animation.md#skipping-the-drop-animation
                      ...(draggableSnapshot.draggingOver === 'droppable-calendar' &&
                      draggableSnapshot.isDropAnimating
                        ? { transitionDuration: `0.001s` }
                        : {}),
                    }}
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

      {dragging && renderDropAreaEnd && null && (
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
