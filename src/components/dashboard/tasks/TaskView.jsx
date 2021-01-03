import React, { useCallback, memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isPast from 'date-fns/isPast';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';

import EventRoundedIcon from '@material-ui/icons/EventRounded';
import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import CalendarViewDayRoundedIcon from '@material-ui/icons/CalendarViewDayRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';

import TaskTitle from './TaskTitle';
import TaskRecurringLabel from './TaskRecurringLabel';
import TaskViewSubtitle from './TaskViewSubtitle';
import TaskViewBlockersList from './TaskViewBlockersList';
import TextWithLinks from '../../ui/TextWithLinks';
import { clearRelativePrioritization } from '../../../modules/tasks';
import formatDateTime from '../../../utils/formatDateTime';

const useStyles = makeStyles((theme) => ({
  outerContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(1)}px`,
    borderBottom: `solid 1px ${theme.palette.divider}`,
    whiteSpace: 'normal',
  },
  copyContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'normal',
  },
  completeButtonIddle: {},
  completeButtonSuccess: {
    color: theme.palette.success.main,
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
  calendarBlockDuration,
  due,
  prioritizedAheadOf,
  showBlockers,
  description,
  score,
  hasRecurringConfig,
  completed,
  onComplete,
  onClick,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleCompleteClick = useCallback(
    (event) => {
      event.stopPropagation();
      onComplete(id);
    },
    [id, onComplete],
  );

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
        <Typography paragraph>{title}</Typography>

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
          <TaskViewSubtitle tooltip="Start date" Icon={EventRoundedIcon} onClick={() => {}}>
            {formatDateTime(scheduledStart)}
            {calendarBlockDuration && ` - ${calendarBlockDuration} minutes blocked`}
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
        <Tooltip title="Complete" arrow enterDelay={1000}>
          <IconButton
            aria-label="Complete"
            onClick={handleCompleteClick}
            className={completed ? classes.completeButtonSuccess : classes.completeButtonIddle}
          >
            {completed ? (
              <CheckCircleOutlineRoundedIcon fontSize="large" />
            ) : (
              <RadioButtonUncheckedRoundedIcon fontSize="large" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
    </Component>
  );
};

TaskView.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.number,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  hasRecurringConfig: PropTypes.bool.isRequired,
  score: PropTypes.number,
  scheduledStart: PropTypes.number,
  calendarBlockDuration: PropTypes.number,
  due: PropTypes.number,
  prioritizedAheadOf: PropTypes.string,
  completed: PropTypes.number,
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
