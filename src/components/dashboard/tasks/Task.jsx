import React, { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import TaskView from './TaskView';
import {
  selectTaskTitle,
  selectTaskDescription,
  selectTaskScore,
  selectTaskCompleted,
  selectTaskScheduledStart,
  selectTaskDue,
  selectTaskPrioritizedAheadOf,
  completeTask,
  undoCompleteTask,
} from '../../../modules/tasks';
import { selectRecurringConfigIdByMostRecentTaskId } from '../../../modules/recurringConfigs';
import { setSnackbarData, resetSnackbar } from '../../../modules/dashboard';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';

const Task = ({ id, position, component, highlighted, showBlockers, editable }) => {
  const title = useSelector((state) => selectTaskTitle(state, id));
  const description = useSelector((state) => selectTaskDescription(state, id));
  const score = useSelector((state) => selectTaskScore(state, id));
  const completed = useSelector((state) => selectTaskCompleted(state, id));
  const scheduledStart = useSelector((state) => selectTaskScheduledStart(state, id));
  const due = useSelector((state) => selectTaskDue(state, id));
  const prioritizedAheadOf = useSelector((state) => selectTaskPrioritizedAheadOf(state, id));
  const hasRecurringConfig = !!useSelector((state) =>
    selectRecurringConfigIdByMostRecentTaskId(state, id),
  );

  const [, openEditTaskDialog] = useEditTaskDialogRouterControl();

  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    openEditTaskDialog(id);
  }, [openEditTaskDialog, id]);

  const [visualCompleted, setVisualCompleted] = useState(completed);
  const cancelCompletion = useRef();
  const handleComplete = useCallback(
    (tid) => {
      if (!visualCompleted) {
        setVisualCompleted(Date.now());
        dispatch(
          setSnackbarData({
            open: true,
            message: '🎉 Task Completed!',
            id: tid,
            buttonText: 'Undo',
            buttonAction: function action() {
              dispatch(undoCompleteTask(tid));
            },
          }),
        );
        cancelCompletion.current = dispatch(completeTask(tid));
      } else if (cancelCompletion) {
        dispatch(resetSnackbar());
        cancelCompletion.current();
        setVisualCompleted(null);
      }
    },
    [dispatch, visualCompleted],
  );

  return (
    <TaskView
      id={id}
      position={position}
      component={component}
      highlighted={highlighted}
      editable={editable}
      title={title}
      description={description}
      score={score}
      completed={visualCompleted}
      scheduledStart={scheduledStart}
      due={due}
      prioritizedAheadOf={prioritizedAheadOf}
      hasRecurringConfig={hasRecurringConfig}
      showBlockers={showBlockers}
      onComplete={handleComplete}
      onClick={editable ? handleClick : undefined}
    />
  );
};

Task.propTypes = {
  id: PropTypes.string.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  position: PropTypes.number,
  component: PropTypes.elementType,
  highlighted: PropTypes.bool,
  editable: PropTypes.bool,
};

Task.defaultProps = {
  position: undefined,
  component: undefined,
  highlighted: undefined,
  editable: false,
};

export default Task;
