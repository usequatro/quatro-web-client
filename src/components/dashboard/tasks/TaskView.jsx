import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isPast from 'date-fns/isPast';

import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';

import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import CalendarViewDayRoundedIcon from '@material-ui/icons/CalendarViewDayRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';
import SnoozeIcon from '@material-ui/icons/Snooze';

import ScheduledIcon from '../../icons/ScheduledIcon';
import TaskTitle from './TaskTitle';
import TaskRecurringLabel from './TaskRecurringLabel';
import TaskViewSubtitle from './TaskViewSubtitle';
import TaskViewBlockersList from './TaskViewBlockersList';
import TextWithLinks from '../../ui/TextWithLinks';
import { clearRelativePrioritization, COMPLETE_DELAY } from '../../../modules/tasks';
import formatDateTime from '../../../utils/formatDateTime';
import CompleteButton from './CompleteButton';
import { EFFORT_LABELS } from '../../../constants/effort';
import AppLogoFull from '../../icons/AppLogoFull';

const formatMinutes = (totalMinutes) => {
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = Math.round(totalMinutes % 60);

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

const COMPLETE_ANIMATION_DURATION = Math.round(COMPLETE_DELAY * 0.66);
const COMPLETE_LOGO_SIZE = 25 * 16;

const useStyles = makeStyles((theme) => ({
  outerContainer: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    padding: `${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(
      1,
    )}px`,
    borderBottom: `solid 1px ${theme.palette.divider}`,
    whiteSpace: 'normal',
    overflow: 'hidden',
  },
  copyContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    whiteSpace: 'normal',
  },
  contentContainer: {
    transition: ({ showCompletedAnimation }) =>
      theme.transitions.create(['transform'], {
        easing: showCompletedAnimation
          ? theme.transitions.duration.easeIn
          : theme.transitions.duration.easeOut,
        duration: COMPLETE_ANIMATION_DURATION,
      }),
    // the contentContainer is usually 70-90% of the container, so 130% should cover it
    transform: ({ showCompletedAnimation }) =>
      showCompletedAnimation ? 'translateX(130%)' : 'translateX(0)',
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
  completeAppLogo: {
    position: 'absolute',
    height: COMPLETE_LOGO_SIZE,
    width: COMPLETE_LOGO_SIZE,
    top: '50%',
    right: '100%',
    color: theme.palette.secondary.main,
    transition: ({ showCompletedAnimation }) =>
      theme.transitions.create('transform', {
        duration: COMPLETE_ANIMATION_DURATION,
        easing: showCompletedAnimation
          ? theme.transitions.duration.easeIn
          : theme.transitions.duration.easeOut,
      }),
    transform: ({ showCompletedAnimation, appLogoCompletionTranslation }) =>
      showCompletedAnimation
        ? `translate(${appLogoCompletionTranslation}, -50%)`
        : 'translate(0, -50%)',
  },
}));

/**
 * This hook let us keep the SVG rendered a bit after showCompletedAnimation turns false
 * @param {boolean} showCompletedAnimation
 * @return {boolean}
 */
const useRenderCompletedAnimationIcon = (showCompletedAnimation) => {
  const [render, setRender] = useState(showCompletedAnimation);
  useEffect(() => {
    if (showCompletedAnimation) {
      setRender(true);
      return undefined;
    }
    const timeout = setTimeout(() => {
      setRender(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [showCompletedAnimation]);
  return render;
};

const TaskView = ({
  id,
  position,
  highlighted,
  editable,
  title,
  scheduledStart,
  snoozedUntil,
  effort,
  calendarBlockDuration,
  due,
  prioritizedAheadOf,
  showBlockers,
  description,
  totalSubtasks,
  totalCompletedSubtasks,
  score,
  hasRecurringConfig,
  completed,
  showCompletedAnimation,
  onClick,
  onCompleteTask,
  onMarkTaskIncomplete,
  parentContainerWidth,
}) => {
  // the app logo relative to the list width changes a lot between screens, so we must calculate
  // the transform to take it all the way to the other side
  const appLogoCompletionTranslation = `${100 * (1 + parentContainerWidth / COMPLETE_LOGO_SIZE)}%`;

  const classes = useStyles({ showCompletedAnimation, appLogoCompletionTranslation });
  const dispatch = useDispatch();

  // Using ListItem when editable, so that along with 'button' prop, we get interaction animations
  const Component = editable ? ListItem : 'div';

  // this hook let us keep the SVG rendered a bit after showCompletedAnimation turns false
  const renderCompletedAnimationIcon =
    useRenderCompletedAnimationIcon(showCompletedAnimation) || showCompletedAnimation;

  return (
    <Component
      data-id={id}
      data-score={score || ''}
      className={classes.outerContainer}
      selected={highlighted}
      onClick={onClick}
      {...(editable ? { button: true } : {})}
    >
      <Box display="flex" flexGrow={1} alignItems="center" className={classes.contentContainer}>
        <Box width="3.5rem" align="center" flexShrink={0}>
          {position !== undefined && (
            <Typography
              component="p"
              variant="h4"
              color="primary"
              title={`Priority score: ${score}`}
            >
              {position}
            </Typography>
          )}
        </Box>

        <Box className={classes.copyContainer}>
          <Box display="flex" justifyContent="space-between">
            <Typography paragraph>{title.trim() || '(no title)'} </Typography>
            {totalSubtasks > 0 && (
              <Chip
                variant="outlined"
                size="small"
                color={totalCompletedSubtasks === totalSubtasks ? 'primary' : 'default'}
                icon={<CheckCircleOutlineIcon />}
                label={`${totalCompletedSubtasks}/${totalSubtasks}`}
              />
            )}
          </Box>

          {description && (
            <Typography
              variant="body2"
              paragraph
              className={classes.descriptionParagraph}
              color="textSecondary"
            >
              <TextWithLinks text={description} maxLength={1200} />
            </Typography>
          )}

          {snoozedUntil && (
            <TaskViewSubtitle tooltip="Snoozed until" Icon={SnoozeIcon} onClick={() => {}}>
              {snoozedUntil < Date.now()
                ? `Was snoozed until ${formatDateTime(snoozedUntil)}`
                : formatDateTime(snoozedUntil)}
            </TaskViewSubtitle>
          )}

          {scheduledStart && (
            <TaskViewSubtitle tooltip="Scheduled date" Icon={ScheduledIcon} onClick={() => {}}>
              {formatDateTime(scheduledStart)}
            </TaskViewSubtitle>
          )}

          {(calendarBlockDuration || EFFORT_LABELS[effort]) && (
            <TaskViewSubtitle
              tooltip={calendarBlockDuration ? 'Time blocked in calendar' : 'Time estimated'}
              Icon={QueryBuilderRoundedIcon}
              onClick={() => {}}
            >
              {calendarBlockDuration
                ? `${formatMinutes(calendarBlockDuration)}`
                : `${EFFORT_LABELS[effort]} estimated`}
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
      </Box>

      <Box flexShrink={0} zIndex={1}>
        <CompleteButton
          taskId={id}
          completed={completed}
          onCompleteTask={onCompleteTask}
          onMarkTaskIncomplete={onMarkTaskIncomplete}
        />
      </Box>

      {renderCompletedAnimationIcon && (
        <AppLogoFull className={classes.completeAppLogo} aria-hidden="true" />
      )}
    </Component>
  );
};

TaskView.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.number,
  title: PropTypes.string.isRequired,
  effort: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  totalSubtasks: PropTypes.number.isRequired,
  totalCompletedSubtasks: PropTypes.number.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  onCompleteTask: PropTypes.func.isRequired,
  onMarkTaskIncomplete: PropTypes.func.isRequired,
  hasRecurringConfig: PropTypes.bool.isRequired,
  score: PropTypes.number,
  scheduledStart: PropTypes.number,
  snoozedUntil: PropTypes.number,
  calendarBlockDuration: PropTypes.number,
  due: PropTypes.number,
  prioritizedAheadOf: PropTypes.string,
  completed: PropTypes.bool,
  showCompletedAnimation: PropTypes.bool,
  onClick: PropTypes.func,
  highlighted: PropTypes.bool,
  editable: PropTypes.bool,
  parentContainerWidth: PropTypes.number,
};

TaskView.defaultProps = {
  position: undefined,
  score: undefined,
  scheduledStart: undefined,
  snoozedUntil: undefined,
  calendarBlockDuration: undefined,
  due: undefined,
  prioritizedAheadOf: undefined,
  completed: undefined,
  showCompletedAnimation: false,
  highlighted: undefined,
  editable: false,
  parentContainerWidth: 700, // some arbitrary value in case upper measurements fail
  onClick: () => {},
};

export default memo(TaskView);
