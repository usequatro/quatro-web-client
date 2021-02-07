import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isPast from 'date-fns/isPast';
import memoizeFunction from 'lodash/memoize';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import EventRoundedIcon from '@material-ui/icons/EventRounded';
import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import CalendarViewDayRoundedIcon from '@material-ui/icons/CalendarViewDayRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';

import TaskTitle from './TaskTitle';
import TaskRecurringLabel from './TaskRecurringLabel';
import TaskViewSubtitle from './TaskViewSubtitle';
import TaskViewBlockersList from './TaskViewBlockersList';
import TextWithLinks from '../../ui/TextWithLinks';
import { clearRelativePrioritization } from '../../../modules/tasks';
import formatDateTime from '../../../utils/formatDateTime';
import CompleteButton from './CompleteButton';
import { EFFORT_SLIDER_MARKS } from '../../../constants/effort';

const getTimeEstimateForEffort = memoizeFunction((effort) => {
  const mark = EFFORT_SLIDER_MARKS.find(({ value }) => value === effort);
  return mark ? mark.label : undefined;
});

const formatMinutes = (totalMinutes) => {
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;

  const HOUR_LABELS = { plural: 'hours', singular: 'hour' };
  const MINUTE_LABELS = { plural: 'minutes', singular: 'minute' };
  const DAY_LABELS = { plural: 'days', singular: 'day' };

  const getLabel = (value, labels) => (value === 1 ? labels.singular : labels.plural);

  return [
    days > 0 ? `${days} ${getLabel(days, DAY_LABELS)}` : '',
    hours > 0 ? `${hours} ${getLabel(hours, HOUR_LABELS)}` : '',
    minutes > 0 ? `${minutes} ${getLabel(minutes, MINUTE_LABELS)}` : '',
  ]
    .filter(Boolean)
    .join(' ');
};

const useStyles = makeStyles((theme) => ({
  outerContainer: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(
      1,
    )}px`,
    borderBottom: `solid 1px ${theme.palette.divider}`,
    whiteSpace: 'normal',
  },
  copyContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'normal',
  },
  blockersIcon: {
    marginRight: theme.spacing(1),
    marginTop: '6px', // to align with first blocker row
  },
  descriptionParagraph: {
    '& a': {
      wordBreak: 'break-all',
    },
  },
}));

const TaskView = ({
  id,
  position,
  highlighted,
  editable,
  title,
  scheduledStart,
  effort,
  calendarBlockDuration,
  due,
  prioritizedAheadOf,
  showBlockers,
  description,
  score,
  hasRecurringConfig,
  completed,
  onClick,
  onCompleteTask,
  onMarkTaskIncomplete,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  // Using ListItem when editable, so that along with 'button' prop, we get interaction animations
  const Component = editable ? ListItem : 'div';

  return (
    <Component
      data-id={id}
      data-score={score || ''}
      className={classes.outerContainer}
      selected={highlighted}
      onClick={onClick}
      {...(editable ? { button: true } : {})}
    >
      <Box width="3.5rem" align="center" flexShrink={0}>
        {position !== undefined && (
          <Typography component="p" variant="h4" color="primary" title={`Priority score: ${score}`}>
            {position}
          </Typography>
        )}
      </Box>

      <Box className={classes.copyContainer}>
        <Typography paragraph>{title.trim() || '(no title)'}</Typography>

        {description && (
          <Typography
            variant="body2"
            paragraph
            className={classes.descriptionParagraph}
            color="textSecondary"
          >
            <TextWithLinks text={description} maxLength={200} />
          </Typography>
        )}

        {scheduledStart && (
          <TaskViewSubtitle tooltip="Scheduled date" Icon={EventRoundedIcon} onClick={() => {}}>
            {formatDateTime(scheduledStart)}
          </TaskViewSubtitle>
        )}

        {(calendarBlockDuration || getTimeEstimateForEffort(effort)) && (
          <TaskViewSubtitle
            tooltip={calendarBlockDuration ? 'Time blocked in calendar' : 'Time estimated'}
            Icon={QueryBuilderRoundedIcon}
            onClick={() => {}}
          >
            {calendarBlockDuration
              ? `${formatMinutes(calendarBlockDuration)}`
              : `${getTimeEstimateForEffort(effort)} estimated`}
          </TaskViewSubtitle>
        )}

        {due && (
          <TaskViewSubtitle
            tooltip="Due date"
            Icon={AccessAlarmRoundedIcon}
            iconProps={{ color: isPast(due) ? 'error' : 'inherit' }}
            onClick={() => {}}
          >
            {formatDateTime(due)}
          </TaskViewSubtitle>
        )}

        {prioritizedAheadOf && (
          <TaskViewSubtitle
            tooltip="Remove custom priority"
            Icon={CalendarViewDayRoundedIcon}
            IconActive={ClearRoundedIcon}
            onClick={(event) => {
              event.stopPropagation();
              dispatch(clearRelativePrioritization(id));
            }}
          >
            {/* eslint-disable react/jsx-curly-brace-presence */}
            {`Manually prioritized ahead of "`}
            <TaskTitle id={prioritizedAheadOf} />
            {'"'}
            {/* eslint-enable react/jsx-curly-brace-presence */}
          </TaskViewSubtitle>
        )}

        {hasRecurringConfig && (
          <TaskViewSubtitle tooltip="Repeats" Icon={ReplayRoundedIcon} onClick={() => {}}>
            <TaskRecurringLabel id={id} />
          </TaskViewSubtitle>
        )}

        {showBlockers && <TaskViewBlockersList id={id} />}
      </Box>

      <Box flexShrink={0}>
        <CompleteButton
          taskId={id}
          completed={completed}
          onCompleteTask={onCompleteTask}
          onMarkTaskIncomplete={onMarkTaskIncomplete}
        />
      </Box>
    </Component>
  );
};

TaskView.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.number,
  title: PropTypes.string.isRequired,
  effort: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  onCompleteTask: PropTypes.func.isRequired,
  onMarkTaskIncomplete: PropTypes.func.isRequired,
  hasRecurringConfig: PropTypes.bool.isRequired,
  score: PropTypes.number,
  scheduledStart: PropTypes.number,
  calendarBlockDuration: PropTypes.number,
  due: PropTypes.number,
  prioritizedAheadOf: PropTypes.string,
  completed: PropTypes.bool,
  onClick: PropTypes.func,
  highlighted: PropTypes.bool,
  editable: PropTypes.bool,
};

TaskView.defaultProps = {
  position: undefined,
  score: undefined,
  scheduledStart: undefined,
  calendarBlockDuration: undefined,
  due: undefined,
  prioritizedAheadOf: undefined,
  completed: undefined,
  highlighted: undefined,
  editable: false,
  onClick: () => {},
};

export default memo(TaskView);
