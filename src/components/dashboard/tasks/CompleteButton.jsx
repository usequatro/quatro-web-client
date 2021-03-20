import React from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';

import useDebouncedState from '../../hooks/useDebouncedState';

const useStyles = makeStyles((theme) => ({
  completeButtonIddle: {},
  completeButtonSuccess: {
    color: theme.palette.success.main,
  },

  // CSS hack to show white background inside the complete icon with the same proportions
  label: {
    position: 'relative',
  },
  background: {
    width: 'calc(100% - 0.5rem)',
    height: 'calc(100% - 0.5rem)',
    top: '0.25rem',
    left: '0.25rem',
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    borderRadius: '100%',
  },
  icon: {
    zIndex: 1,
  },
  placeholderIcon: {
    visibility: 'hidden',
  },
}));

const CompleteButton = ({
  taskId,
  completed,
  onCompleteTask,
  onMarkTaskIncomplete,
  fontSize,
  size,
  className,
}) => {
  const classes = useStyles();

  const handleComplete = (event) => {
    event.stopPropagation();
    onCompleteTask(taskId);
  };

  const handleMarkIncomplete = (event) => {
    event.stopPropagation();
    onMarkTaskIncomplete(taskId);
  };

  // This debounce helps the tip title stay the same when clicking the button
  const debouncedComplete = useDebouncedState(completed, 2000);

  return (
    <Tooltip title={debouncedComplete ? 'Mark incomplete' : 'Complete'} arrow enterDelay={250}>
      <IconButton
        edge="end"
        aria-label={completed ? 'Mark incomplete' : 'Complete'}
        size={size}
        onMouseDown={(event) => event.stopPropagation()} // stop ripple effect on parent
        onClick={completed ? handleMarkIncomplete : handleComplete}
        classes={{
          root: [
            className,
            completed ? classes.completeButtonSuccess : classes.completeButtonIddle,
          ].join(' '),
          label: classes.label,
        }}
      >
        {/* CSS hack to show white background inside the complete icon with the same proportions */}
        <span className={classes.background} aria-hidden>
          <CheckCircleOutlineRoundedIcon fontSize={fontSize} className={classes.placeholderIcon} />
        </span>

        {completed ? (
          <CheckCircleOutlineRoundedIcon className={classes.icon} fontSize={fontSize} />
        ) : (
          <RadioButtonUncheckedRoundedIcon className={classes.icon} fontSize={fontSize} />
        )}
      </IconButton>
    </Tooltip>
  );
};

CompleteButton.propTypes = {
  taskId: PropTypes.string.isRequired,
  completed: PropTypes.oneOfType([PropTypes.bool, PropTypes.exact(null)]),
  className: PropTypes.string,
  onCompleteTask: PropTypes.func.isRequired,
  onMarkTaskIncomplete: PropTypes.func.isRequired,
  fontSize: PropTypes.oneOf(['default', 'large', 'small', 'inherit']),
  size: PropTypes.oneOf(['medium', 'small']),
};

CompleteButton.defaultProps = {
  completed: null,
  className: '',
  fontSize: 'large',
  size: 'medium',
};

export default CompleteButton;
