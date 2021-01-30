import React, { memo, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import cond from 'lodash/cond';

import format from 'date-fns/format';
import isPast from 'date-fns/isPast';
import isToday from 'date-fns/isToday';
import isValid from 'date-fns/isValid';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

import { completeTask, markTaskIncomplete } from '../../../modules/tasks';
import CompleteButton from '../tasks/CompleteButton';

const useStyles = makeStyles((theme) => ({
  eventCard: ({ color, declined }) => ({
    width: '100%',
    padding: `${theme.spacing(1) / 2}px ${theme.spacing(1)}px`,
    borderRadius: 5,
    color: declined ? color : theme.palette.getContrastText(color),
    backgroundColor: declined ? theme.palette.background.paper : color,
    border: `solid 1px ${declined ? color : theme.palette.getContrastText(color)}`,
    outline: 'none',
    textDecoration: declined ? 'line-through' : 'initial',
    clipPath: 'border-box', // needed by iOS Safari, otherwise it shows overflowing text (ignores overflow hidden)
    display: 'flex',
    flexShrink: 0,
    alignItems: 'flex-start',
  }),
  eventName: {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 'inherit',
    flexGrow: 1,
  },
  eventDate: {
    fontSize: `${parseFloat(theme.typography.body2.fontSize) * 0.8}rem`,
  },
  scrollAnchor: {
    width: 0,
    height: 0,
    display: 'block',
    transform: 'translateY(-100px)',
  },
}));

const EventCardView = forwardRef(function EventCardViewComponent(
  {
    id,
    scrollAnchorRef,
    elevated,
    summary,
    startTimestamp,
    endTimestamp,
    allDay,
    declined,
    taskId,
    showComplete,
    selectable,
    onSelect,
    isBeingRedragged,
    color,
    height,
    width,
    coordinates,
  },
  ref,
) {
  const dispatch = useDispatch();

  const classes = useStyles({ color, declined });

  const [focused, setFocused] = useState(false);

  const translateYValue = typeof coordinates.y === 'number' ? `${coordinates.y}px` : coordinates.y;

  return (
    <>
      <Card
        key={id}
        data-id={id}
        style={{
          height,
          transform: `translateY(${translateYValue})`,
          opacity: cond([
            [() => isBeingRedragged, () => 0.1],
            [() => !allDay && isToday(endTimestamp) && isPast(endTimestamp), () => 0.8],
            [() => declined, () => 0.7],
            [() => true, () => 1],
          ])(),
          zIndex: 1,
          cursor: selectable ? 'pointer' : 'auto',
          ...(!allDay
            ? {
                position: 'absolute',
                width,
                left: coordinates.x,
              }
            : {}),
        }}
        className={classes.eventCard}
        elevation={elevated || focused ? 8 : 0}
        ref={ref}
        {...(selectable
          ? {
              role: 'button',
              tabIndex: 0,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
              onClick: onSelect,
              onKeyPress: () => (event) => {
                // @todo: figure out why this doesn't work
                if (event.key === ' ' || event.key === 'Enter') {
                  event.stopPropagation();
                  onSelect(event);
                }
              },
            }
          : {
              title: summary,
            })}
      >
        {scrollAnchorRef && (
          <span
            id="event-card-scroll-anchor"
            ref={scrollAnchorRef}
            className={classes.scrollAnchor}
          />
        )}
        <Typography component="p" className={classes.eventName}>
          {summary || '(No title)'}
          {!allDay && (
            <span className={classes.eventDate}>
              {', '}
              {isValid(startTimestamp) ? format(startTimestamp, 'h:mm a') : ''}
              {' - '}
              {isValid(endTimestamp) ? format(endTimestamp, 'h:mm a') : ''}
            </span>
          )}
        </Typography>

        {taskId && showComplete && (
          <CompleteButton
            taskId={taskId}
            completed={null}
            onCompleteTask={() => dispatch(completeTask(taskId))}
            onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
            fontSize="default"
            size="small"
          />
        )}
      </Card>
    </>
  );
});

EventCardView.propTypes = {
  id: PropTypes.string.isRequired,
  elevated: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  summary: PropTypes.string.isRequired,
  startTimestamp: PropTypes.number.isRequired,
  endTimestamp: PropTypes.number.isRequired,
  allDay: PropTypes.bool.isRequired,
  declined: PropTypes.bool.isRequired,
  taskId: PropTypes.string,
  showComplete: PropTypes.bool.isRequired,
  selectable: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  isBeingRedragged: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  coordinates: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
};

EventCardView.defaultProps = {
  scrollAnchorRef: undefined,
  taskId: null,
};

export default memo(EventCardView);
