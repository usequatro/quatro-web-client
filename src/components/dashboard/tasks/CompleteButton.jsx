import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import { useNotification } from '../../Notification';

const useStyles = makeStyles((theme) => ({
  completeButtonIddle: {},
  completeButtonSuccess: {
    color: theme.palette.success.main,
  },
}));

const CompleteButton = ({
  taskId,
  completed,
  onCompleteTask,
  onMarkTaskIncomplete,
  fontSize,
  size,
}) => {
  const classes = useStyles();
  const { notifyInfo } = useNotification();

  const [visuallyCompleted, setVisuallyCompleted] = useState(completed);
  const cancelCompletion = useRef();
  const closeNotificationRef = useRef();

  useEffect(() => {
    setVisuallyCompleted(completed);
  }, [completed]);

  const handleComplete = (event) => {
    event.stopPropagation();
    if (!visuallyCompleted) {
      setVisuallyCompleted(Date.now());
      closeNotificationRef.current = notifyInfo({
        icon: '🎉',
        message: 'Task Completed!',
        buttons: [
          {
            children: 'Undo',
            onClick: () => {
              onMarkTaskIncomplete(taskId);
            },
          },
        ],
      });

      cancelCompletion.current = onCompleteTask(taskId);
    } else if (cancelCompletion.current) {
      if (closeNotificationRef.current) {
        closeNotificationRef.current();
      }
      cancelCompletion.current();
      setVisuallyCompleted(null);
    }
  };

  const cancelMarkIncomplete = useRef();

  const handleMarkIncomplete = (event) => {
    event.stopPropagation();
    if (visuallyCompleted) {
      setVisuallyCompleted(null);
      cancelMarkIncomplete.current = onMarkTaskIncomplete(taskId);
    } else if (cancelMarkIncomplete.current) {
      cancelMarkIncomplete.current();
      setVisuallyCompleted(completed);
    }
  };

  return (
    <Tooltip title={completed ? 'Mark incomplete' : 'Complete'} arrow enterDelay={250}>
      <IconButton
        edge="end"
        aria-label={completed ? 'Mark incomplete' : 'Complete'}
        size={size}
        onClick={completed ? handleMarkIncomplete : handleComplete}
        className={visuallyCompleted ? classes.completeButtonSuccess : classes.completeButtonIddle}
      >
        {visuallyCompleted ? (
          <CheckCircleOutlineRoundedIcon fontSize={fontSize} />
        ) : (
          <RadioButtonUncheckedRoundedIcon fontSize={fontSize} />
        )}
      </IconButton>
    </Tooltip>
  );
};

CompleteButton.propTypes = {
  taskId: PropTypes.string.isRequired,
  completed: PropTypes.oneOfType([PropTypes.number, PropTypes.exact(null)]),
  onCompleteTask: PropTypes.func.isRequired,
  onMarkTaskIncomplete: PropTypes.func.isRequired,
  fontSize: PropTypes.oneOf(['default', 'large', 'small', 'inherit']),
  size: PropTypes.oneOf(['medium', 'small']),
};

CompleteButton.defaultProps = {
  completed: null,
  fontSize: 'large',
  size: 'medium',
};

export default CompleteButton;
