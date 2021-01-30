import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';

import CalendarEventPlaceholder from './CalendarEventPlaceholder';
import { selectDefaultCalendarId } from '../../../modules/calendars';

const CalendarDroppable = ({ children, className, tickHeight, ticksPerHour }) => {
  const containerRef = useRef();

  const isDropDisabled = useSelector((state) => !selectDefaultCalendarId(state));

  return (
    <Droppable droppableId="droppable-calendar" isDropDisabled={isDropDisabled}>
      {(droppableProvided, droppableSnapshot) => (
        <div
          {...droppableProvided.droppableProps}
          ref={(node) => {
            droppableProvided.innerRef(node);
            containerRef.current = node;
          }}
          className={className}
        >
          {children}

          {droppableSnapshot.isDraggingOver && (
            <CalendarEventPlaceholder
              containerRef={containerRef}
              tickHeight={tickHeight}
              ticksPerHour={ticksPerHour}
            />
          )}

          {/* placeholder, although we never want to show it, so force it hidden */}
          <div style={{ display: 'none' }}>{droppableProvided.placeholder}</div>
        </div>
      )}
    </Droppable>
  );
};

CalendarDroppable.propTypes = {
  className: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

export default CalendarDroppable;
