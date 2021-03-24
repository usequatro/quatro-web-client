import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const CardPositionedBoundaries = forwardRef(function EventCardViewComponent(
  { allDay, height, width, coordinates, children },
  ref,
) {
  const translateYValue = typeof coordinates.y === 'number' ? `${coordinates.y}px` : coordinates.y;

  return (
    <div
      ref={ref}
      style={{
        height,
        width,
        left: coordinates.x,
        position: allDay ? 'static' : 'absolute',
        zIndex: 1,
        transform: `translateY(${translateYValue})`,
      }}
    >
      {children}
    </div>
  );
});

CardPositionedBoundaries.propTypes = {
  allDay: PropTypes.bool.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  coordinates: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  children: PropTypes.node.isRequired,
};

CardPositionedBoundaries.defaultProps = {};

export default CardPositionedBoundaries;
