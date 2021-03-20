import React, { memo, forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import cond from 'lodash/cond';

import format from 'date-fns/format';
import isPast from 'date-fns/isPast';
import isToday from 'date-fns/isToday';
import isValid from 'date-fns/isValid';

import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';

import { completeTask, markTaskIncomplete } from '../../../modules/tasks';
import CompleteButton from '../tasks/CompleteButton';
import { useNotification } from '../../Notification';

const useStyles = makeStyles((theme) => ({
  eventCard: ({ color, declined, small }) => ({
    width: '100%',
    padding: `${theme.spacing(1) / (small ? 4 : 2)}px ${theme.spacing(1)}px`,
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
    fontSize: ({ small }) =>
      small ? theme.typography.caption.fontSize : theme.typography.body2.fontSize,
    lineHeight: 'inherit',
    flexGrow: 1,
  },
  eventDate: {
    fontSize: `${parseFloat(theme.typography.body2.fontSize) * 0.8}rem`,
  },
  completeButton: ({ small }) => (small ? { paddingTop: 0 } : {}),
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
    className,
    scrollAnchorRef,
    elevated,
    summary,
    startTimestamp,
    endTimestamp,
    allDay,
    declined,
    taskId,
    completed,
    showCompleteButton,
    synching,
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
  const { notifyInfo } = useNotification();

  const classes = useStyles({ color, declined, small: height < 30 });

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
            [() => synching, () => 0.7],
            [() => !allDay && isToday(endTimestamp) && isPast(endTimestamp), () => 0.8],
            [() => declined, () => 0.7],
            [() => true, () => 1],
          ])(),
          zIndex: 1,
          cursor: selectable ? 'pointer' : 'auto',
          width,
          left: coordinates.x,
          position: allDay ? 'static' : 'absolute',
        }}
        className={[classes.eventCard, className].filter(Boolean).join(' ')}
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
        {synching && (
          <Box mr={1}>
            <CircularProgress thickness={4} size="1.25rem" color="inherit" />
          </Box>
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

        {taskId && showCompleteButton && !synching && (
          <CompleteButton
            taskId={taskId}
            completed={completed}
            onCompleteTask={() => dispatch(completeTask(taskId, notifyInfo))}
            onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
            fontSize="default"
            size="small"
            className={classes.completeButton}
          />
        )}
      </Card>
    </>
  );
});

EventCardView.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  elevated: PropTypes.bool.isRequired,
  scrollAnchorRef: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  summary: PropTypes.string.isRequired,
  startTimestamp: PropTypes.number.isRequired,
  endTimestamp: PropTypes.number.isRequired,
  allDay: PropTypes.bool.isRequired,
  declined: PropTypes.bool.isRequired,
  taskId: PropTypes.string,
  completed: PropTypes.bool.isRequired,
  showCompleteButton: PropTypes.bool.isRequired,
  synching: PropTypes.bool.isRequired,
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
  className: undefined,
  taskId: null,
};

export default memo(EventCardView);
