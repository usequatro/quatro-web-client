import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import TaskView from './TaskView';
import {
  selectTaskTitle,
  selectTaskDescription,
  selectTaskScore,
  selectTaskShowsAsCompleted,
  selectTaskScheduledStart,
  selectTaskCalendarBlockDuration,
  selectTaskDue,
  selectTaskPrioritizedAheadOf,
  completeTask,
  markTaskIncomplete,
  selectTaskEffort,
} from '../../../modules/tasks';
import { selectRecurringConfigIdByMostRecentTaskId } from '../../../modules/recurringConfigs';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';
import { useNotification } from '../../Notification';

const Task = ({ id, position, component, highlighted, showBlockers, editable }) => {
  const dispatch = useDispatch();
  const { notifyInfo } = useNotification();

  const title = useSelector((state) => selectTaskTitle(state, id));
  const description = useSelector((state) => selectTaskDescription(state, id));
  const score = useSelector((state) => selectTaskScore(state, id));
  const effort = useSelector((state) => selectTaskEffort(state, id));
  const completed = useSelector((state) => selectTaskShowsAsCompleted(state, id));
  const scheduledStart = useSelector((state) => selectTaskScheduledStart(state, id));
  const calendarBlockDuration = useSelector((state) => selectTaskCalendarBlockDuration(state, id));
  const due = useSelector((state) => selectTaskDue(state, id));
  const prioritizedAheadOf = useSelector((state) => selectTaskPrioritizedAheadOf(state, id));
  const hasRecurringConfig = !!useSelector((state) =>
    selectRecurringConfigIdByMostRecentTaskId(state, id),
  );

  const [, openEditTaskDialog] = useEditTaskDialogRouterControl();

  const handleClick = useCallback(() => {
    openEditTaskDialog(id);
  }, [openEditTaskDialog, id]);

  const onCompleteTask = useCallback(() => {
    dispatch(completeTask(id, notifyInfo));
  }, [dispatch, notifyInfo, id]);

  const onMarkTaskIncomplete = useCallback(() => {
    dispatch(markTaskIncomplete(id));
  }, [dispatch, id]);

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
      completed={completed}
      effort={effort}
      scheduledStart={scheduledStart}
      calendarBlockDuration={calendarBlockDuration}
      due={due}
      prioritizedAheadOf={prioritizedAheadOf}
      hasRecurringConfig={hasRecurringConfig}
      showBlockers={showBlockers}
      onClick={editable ? handleClick : undefined}
      onCompleteTask={onCompleteTask}
      onMarkTaskIncomplete={onMarkTaskIncomplete}
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
