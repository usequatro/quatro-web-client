import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Droppable } from 'react-beautiful-dnd';
import Card from '@material-ui/core/Card';

import { makeStyles } from '@material-ui/core/styles';

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

const Placeholder = ({ containerRef }) => {
  const classes = useStyles();
  const [y, setY] = useState({});

  useEffect(() => {
    const updateMouseCoordinates = (event) => {
      if (!containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      setY(event.clientY - rect.top);
    };
    document.addEventListener('mousemove', updateMouseCoordinates);
    return () => document.removeEventListener('mousemove', updateMouseCoordinates);
  }, [containerRef]);

  return (
    <Card
      style={{
        height: 100,
        width: '100%',
        transform: `translateY(${y}px)`,
        zIndex: 3,
        position: 'absolute',
      }}
      className={classes.placeholder}
      elevation={0}
    />
  );
};

const CalendarDroppable = ({ droppableId, children, className }) => {
  const containerRef = useRef();

  return (
    <Droppable droppableId={droppableId}>
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

          {droppableSnapshot.isDraggingOver && <Placeholder containerRef={containerRef} />}

          <div>{droppableProvided.placeholder}</div>
        </div>
      )}
    </Droppable>
  );
};

CalendarDroppable.propTypes = {
  droppableId: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
};

export default CalendarDroppable;
