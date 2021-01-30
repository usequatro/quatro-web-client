import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import throttle from 'lodash/throttle';
import { Droppable } from 'react-beautiful-dnd';
import Card from '@material-ui/core/Card';

import { makeStyles } from '@material-ui/core/styles';

import { useAppDragDropContext } from '../DashboardDragDropContext';

const useStyles = makeStyles((theme) => ({
  '@keyframes blinker': {
    '0%': { opacity: 0.5 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.5 },
  },
  placeholder: {
    width: '100%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.action.active,
    outline: 'none',
    animationName: '$blinker',
    animationDuration: '3s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
}));

const clientYGetters = {
  touchmove: (event) => get(event, 'touches[0].clientY'),
  mousemove: (event) => get(event, 'clientY'),
};
const noop = () => {};

const round = (value, step) => {
  const factor = value / step;
  const floor = Math.floor(factor);
  const times = floor + (Math.abs(factor - floor) < 0.5 ? 0 : 1);
  return times * step;
};

const Placeholder = ({ containerRef, tickHeight, ticksPerHour }) => {
  const classes = useStyles();
  const [y, setY] = useState(0);

  const { getCalendarDragPlaceholderPositionRef } = useAppDragDropContext();

  useEffect(() => {
    const updateMouseCoordinates = throttle((event) => {
      if (!containerRef.current) {
        return;
      }

      const clientY = (clientYGetters[event.type] || noop)(event);
      if (clientY == null) {
        console.warn('Invalid clientY on event', event); // eslint-disable-line no-console
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const paddingTop = window
        .getComputedStyle(containerRef.current, null)
        .getPropertyValue('padding-top');
      const paddingTopInt = parseInt(paddingTop, 10);
      setY(clientY - rect.top - paddingTopInt + containerRef.current.scrollTop);
    }, 10);
    document.addEventListener('mousemove', updateMouseCoordinates);
    document.addEventListener('touchmove', updateMouseCoordinates);
    return () => {
      document.removeEventListener('mousemove', updateMouseCoordinates);
      document.removeEventListener('touchmove', updateMouseCoordinates);
    };
  }, [containerRef]);

  const snapHeight = (ticksPerHour * tickHeight) / 4;
  const snappedY = round(y, snapHeight);

  getCalendarDragPlaceholderPositionRef.current = () => ({
    ticks: snappedY / snapHeight / 4,
    minutes: (snappedY / snapHeight / 4) * ticksPerHour * 60,
  });

  return (
    <Card
      style={{
        height: 100,
        width: '100%',
        transform: `translateY(${snappedY}px)`,
        zIndex: 3,
        position: 'absolute',
      }}
      className={classes.placeholder}
      elevation={0}
    />
  );
};

Placeholder.propTypes = {
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
  tickHeight: PropTypes.number.isRequired,
  ticksPerHour: PropTypes.number.isRequired,
};

const CalendarDroppable = ({ children, className, tickHeight, ticksPerHour }) => {
  const containerRef = useRef();

  return (
    <Droppable droppableId="droppable-calendar">
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
            <Placeholder
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
