import React, { useCallback, useRef } from 'react';
import { useDispatch , useSelector } from 'react-redux';
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
} from '../../../modules/tasks';
import { selectRecurringConfigIdByMostRecentTaskId } from '../../../modules/recurringConfigs';
import { setEditTaskDialogId } from '../../../modules/dashboard';

const Task = ({ id, position, component, highlighted, showBlockers }) => {
  const title = useSelector(state => selectTaskTitle(state, id));
  const description = useSelector(state => selectTaskDescription(state, id));
  const score = useSelector(state => selectTaskScore(state, id));
  const completed = useSelector(state => selectTaskCompleted(state, id));
  const scheduledStart = useSelector(state => selectTaskScheduledStart(state, id));
  const due = useSelector(state => selectTaskDue(state, id));
  const prioritizedAheadOf = useSelector(state => selectTaskPrioritizedAheadOf(state, id));
  const hasRecurringConfig = !!useSelector(state => selectRecurringConfigIdByMostRecentTaskId(state, id));

  const dispatch = useDispatch();
  const handleClick = useCallback(() => dispatch(setEditTaskDialogId(id)), [id, dispatch]);

  const cancelCompletion = useRef();
  const handleComplete = useCallback((tid) => {
    if (!completed) {
      cancelCompletion.current = dispatch(completeTask(tid));
    } else if (cancelCompletion) {
      cancelCompletion.current();
    }
  }, [dispatch, completed]);

  return (
    <TaskView
      id={id}
      position={position}
      component={component}
      highlighted={highlighted}
      title={title}
      description={description}
      score={score}
      completed={completed}
      scheduledStart={scheduledStart}
      due={due}
      prioritizedAheadOf={prioritizedAheadOf}
      hasRecurringConfig={hasRecurringConfig}
      showBlockers={showBlockers}
      onComplete={handleComplete}
      onClick={handleClick}
    />
  )
}

Task.propTypes = {
  id: PropTypes.string.isRequired,
  showBlockers: PropTypes.bool.isRequired,
  position: PropTypes.number,
  component: PropTypes.elementType,
  highlighted: PropTypes.bool,
};

Task.defaultProps = {
  position: undefined,
  component: undefined,
  highlighted: undefined,
};

export default Task;