import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const CardPositionedBoundaries = forwardRef(
  (
    {
      id,
      allDay,
      height,
      width,
      coordinates,
      children,
      isDragging,
      isDropAnimating,
      draggableProps,
    },
    ref,
  ) => {
    const translateYValue =
      typeof coordinates.y === 'number' ? `${coordinates.y}px` : coordinates.y;

    // We only allow the transform of drag and drop to apply when being dragged
    // we get around react-beautiful-dnd trying to manage other list elements
    const transform =
      isDragging && draggableProps.style && draggableProps.style.transform
        ? draggableProps.style.transform
        : `translateY(${translateYValue})`;

    // We remove the opacity from the transition to not show at all the default draggable snapshot
    // We use custom placeholder CalendarEventPlaceholder
    const transition =
      isDragging && draggableProps.style && draggableProps.style.transition
        ? draggableProps.style.transition
            .split(', ')
            .filter((property) => !property.includes('opacity'))
            .join(', ')
        : '';

    return (
      <div
        data-id={id}
        ref={ref}
        {...draggableProps}
        style={{
          ...(isDragging ? draggableProps.style || {} : {}),
          height,
          width,
          left: coordinates.x,
          position: allDay ? 'static' : 'absolute',
          zIndex: 1,
          transform,
          transition,
          // Hide the default draggable snapshot, because
          // we use custom placeholder CalendarEventPlaceholder
          opacity: isDragging ? 0 : 1,
          // Removing the drop animation on the calendar bc its delay allows users to
          // move the placeholder away from where it was
          // @link https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/drop-animation.md#skipping-the-drop-animation
          ...(isDropAnimating ? { transitionDuration: `0.001s` } : {}),
        }}
      >
        {children}
      </div>
    );
  },
);

CardPositionedBoundaries.propTypes = {
  id: PropTypes.string.isRequired,
  allDay: PropTypes.bool.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  coordinates: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  children: PropTypes.node.isRequired,
  isDragging: PropTypes.bool,
  isDropAnimating: PropTypes.bool,
  draggableProps: PropTypes.shape({
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }),
};

CardPositionedBoundaries.defaultProps = {
  draggableProps: {},
  isDragging: false,
  isDropAnimating: false,
};

export default CardPositionedBoundaries;
