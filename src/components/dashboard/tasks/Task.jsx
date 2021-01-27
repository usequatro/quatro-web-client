import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import TaskView from './TaskView';
import {
  selectTaskTitle,
  selectTaskDescription,
  selectTaskScore,
  selectTaskCompleted,
  selectTaskScheduledStart,
  selectTaskCalendarBlockDuration,
  selectTaskDue,
  selectTaskPrioritizedAheadOf,
  completeTask,
  markTaskIncomplete,
} from '../../../modules/tasks';
import { selectRecurringConfigIdByMostRecentTaskId } from '../../../modules/recurringConfigs';
import useEditTaskDialogRouterControl from '../../hooks/useEditTaskDialogRouterControl';

const Task = ({ id, position, component, highlighted, showBlockers, editable }) => {
  const dispatch = useDispatch();

  const title = useSelector((state) => selectTaskTitle(state, id));
  const description = useSelector((state) => selectTaskDescription(state, id));
  const score = useSelector((state) => selectTaskScore(state, id));
  const completed = useSelector((state) => selectTaskCompleted(state, id));
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
      scheduledStart={scheduledStart}
      calendarBlockDuration={calendarBlockDuration}
      due={due}
      prioritizedAheadOf={prioritizedAheadOf}
      hasRecurringConfig={hasRecurringConfig}
      showBlockers={showBlockers}
      onClick={editable ? handleClick : undefined}
      onCompleteTask={() => dispatch(completeTask(id))}
      onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(id))}
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
