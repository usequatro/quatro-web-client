import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Droppable, Draggable } from 'react-beautiful-dnd';

import Paper from '@material-ui/core/Paper';

import { useAppDragDropContext } from '../DashboardDragDropContext';
import { DROP_AREA_HEIGHT } from './TaskSiblingListDropArea';

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
  dashboardTab,
  enabled,
  itemIds,
  renderItem,
  renderDropAreaStart,
  renderDropAreaEnd,
  indexOffset,
  scrollContainerRef,
}) => {
  const { dragging } = useAppDragDropContext();

  const id = dashboardTab.replace(/[^a-z1-9]/i, '');

  // force a scroll after dragging starts so the appearance of the "Top 4" droppable doesn't
  // disrupt where the dragging cursor is placed.
  // @todo: only works when backlog list overflows. Handle too when it doesn't
  // @todo: better considering placing a fixed droppable on the top or nav bar
  useEffect(() => {
    if (dragging && renderDropAreaStart && scrollContainerRef && scrollContainerRef.current) {
      const node = scrollContainerRef.current;
      node.scroll(0, node.scrollTop + parseInt(DROP_AREA_HEIGHT, 10));
      return () => {
        node.scroll(0, node.scrollTop - parseInt(DROP_AREA_HEIGHT, 10));
      };
    }
    return undefined;
  }, [renderDropAreaStart, dragging, scrollContainerRef]);

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
                      opacity: draggableSnapshot.draggingOver === 'droppable-calendar' ? 0 : 1,
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
  dashboardTab: PropTypes.string.isRequired,
  enabled: PropTypes.bool.isRequired,
  dropAreaHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  itemIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  renderItem: PropTypes.func.isRequired,
  indexOffset: PropTypes.number.isRequired,
  renderDropAreaStart: PropTypes.func,
  renderDropAreaEnd: PropTypes.func,
  scrollContainerRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};

Sortable.defaultProps = {
  renderDropAreaStart: undefined,
  renderDropAreaEnd: undefined,
};

export default Sortable;
