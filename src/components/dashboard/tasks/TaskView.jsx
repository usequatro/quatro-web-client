import React, { useCallback, memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isPast from 'date-fns/isPast';
import memoize from 'lodash/memoize';
import truncate from 'lodash/truncate';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
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
import { clearRelativePrioritization } from '../../../modules/tasks';
import formatDateTime from '../../../utils/formatDateTime';

const MAX_DESCRIPTION_CHARACTERS = 200;

const DescriptionLink = ({ ...props }) => (
  <Link target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} {...props} />
);

/**
 * @param {string} text
 * @return {React[]}
 */
const parseDescription = memoize((text) => {
  const tmp = '|+|-|+|';
  const pieces = text.replace(/(https?:\/\/[^\s]+)/gi, `${tmp}$1${tmp}`).split(tmp);

  let remainingLength = MAX_DESCRIPTION_CHARACTERS;

  return pieces
    .map((piece, index) => {
      if (remainingLength <= 0) {
        return null;
      }
      const truncatedPiece = truncate(piece, { separator: ' ', length: remainingLength });
      remainingLength -= truncatedPiece.length;

      const isLink = index % 2 === 1;

      /* eslint-disable react/no-array-index-key */
      return isLink ? (
        <DescriptionLink href={piece} key={index}>
          {truncatedPiece}
        </DescriptionLink>
      ) : (
        <React.Fragment key={index}>{truncatedPiece}</React.Fragment>
      );
      /* eslint-enable react/no-array-index-key */
    })
    .filter(Boolean);
});

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
  },
  completeButtonIddle: {},
  completeButtonSuccess: {
    color: theme.palette.success.main,
  },
  blockersIcon: {
    marginRight: theme.spacing(1),
    marginTop: '6px', // to align with first blocker row
  },
}));

const TaskView = ({
  id,
  position,
  component,
  highlighted,
  title,
  scheduledStart,
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

  return (
    <Paper
      data-id={id}
      data-score={score || ''}
      className={classes.outerContainer}
      square
      component={component}
      selected={highlighted}
      elevation={0}
      onClick={onClick}
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
          <Typography variant="body2" paragraph>
            {parseDescription(description)}
          </Typography>
        )}

        {scheduledStart && (
          <TaskViewSubtitle tooltip="Start date" Icon={EventRoundedIcon} onClick={() => {}}>
            {formatDateTime(scheduledStart)}
          </TaskViewSubtitle>
        )}

        {due && (
          <TaskViewSubtitle
            tooltip="Due date"
            Icon={AccessAlarmRoundedIcon}
            iconProps={{ color: isPast(due) ? 'error' : 'secondary' }}
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
      </Box>
    </Paper>
  );
};

TaskView.propTypes = {
  id: PropTypes.string.isRequired,
  position: PropTypes.number,
  component: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  onComplete: PropTypes.func.isRequired,
  hasRecurringConfig: PropTypes.bool.isRequired,
  score: PropTypes.number,
  scheduledStart: PropTypes.number,
  due: PropTypes.number,
  prioritizedAheadOf: PropTypes.string,
  completed: PropTypes.number,
  onClick: PropTypes.func,
  highlighted: PropTypes.bool,
};

TaskView.defaultProps = {
  position: undefined,
  component: undefined,
  score: undefined,
  scheduledStart: undefined,
  due: undefined,
  prioritizedAheadOf: undefined,
  completed: undefined,
  highlighted: undefined,
  onClick: () => {},
};

export default memo(TaskView);
