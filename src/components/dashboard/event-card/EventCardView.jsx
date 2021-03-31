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
  eventCard: ({ color, declined, smallCard }) => ({
    width: '100%',
    height: '100%',
    padding: `${theme.spacing(1) / (smallCard ? 4 : 2)}px ${theme.spacing(1)}px`,
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
  eventTitleRow: {
    lineHeight: 'inherit',
    flexGrow: 1,
  },
  eventTitle: {
    fontSize: ({ smallCard }) =>
      smallCard ? theme.typography.caption.fontSize : theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  eventDate: {
    fontSize: `${parseFloat(theme.typography.body2.fontSize) * 0.8}rem`,
  },
  completeButton: ({ smallCard }) => (smallCard ? { paddingTop: 0 } : {}),
  scrollAnchor: {
    width: 0,
    height: 0,
    display: 'block',
    transform: 'translateY(-100px)',
  },
}));

const EventCardView = forwardRef(
  (
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
      draggable,
      onSelect,
      isBeingRedragged,
      color,
      smallCard,
    },
    ref,
  ) => {
    const dispatch = useDispatch();
    const { notifyInfo } = useNotification();

    const classes = useStyles({ color, declined, smallCard });

    const [focused, setFocused] = useState(false);

    return (
      <Card
        key={id}
        data-id={id}
        style={{
          opacity: cond([
            [() => isBeingRedragged, () => 0.1],
            [() => synching, () => 0.7],
            [() => !allDay && isToday(endTimestamp) && isPast(endTimestamp), () => 0.8],
            [() => declined, () => 0.7],
            [() => true, () => 1],
          ])(),
          // eslint-disable-next-line no-nested-ternary
          cursor: draggable ? 'grab' : selectable ? 'pointer' : 'auto',
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

        <Typography component="p" className={classes.eventTitleRow}>
          <span className={classes.eventTitle}>{summary || '(No title)'}</span>
          {!allDay && (
            <span className={classes.eventDate}>
              {', '}
              {isValid(startTimestamp) ? format(startTimestamp, 'h:mm a') : ''}
              {' - '}
              {isValid(endTimestamp) ? format(endTimestamp, 'h:mm a') : ''}
            </span>
          )}
        </Typography>

        {synching && (
          <Box ml={1}>
            <CircularProgress thickness={6} size={smallCard ? '1em' : '1.5em'} color="inherit" />
          </Box>
        )}

        {taskId && showCompleteButton && !synching && (
          <CompleteButton
            taskId={taskId}
            completed={completed}
            onCompleteTask={() => dispatch(completeTask(taskId, notifyInfo))}
            onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
            fontSize={smallCard ? 'small' : 'default'}
            size="small"
            className={classes.completeButton}
          />
        )}
      </Card>
    );
  },
);

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
  draggable: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  isBeingRedragged: PropTypes.bool.isRequired,
  smallCard: PropTypes.bool.isRequired,
  color: PropTypes.string.isRequired,
};

EventCardView.defaultProps = {
  scrollAnchorRef: undefined,
  className: undefined,
  taskId: null,
};

export default memo(EventCardView);
