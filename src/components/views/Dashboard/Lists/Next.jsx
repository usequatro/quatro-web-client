import React from 'react';
import { connect } from 'react-redux';

import { getNextTasks } from '../../../../modules/tasks';
import { NEXT } from '../../../../constants/dashboardTabs';

import Task from '../Shared/Task';
import TaskListWorkspace from '../Shared/TaskListWorkspace';
import NOW_TASKS_LIMIT from '../../../../constants/nowTasksLimit';

const Next = ({ tasks }) => (
  <TaskListWorkspace
    taskListId={NEXT}
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        ranking={NOW_TASKS_LIMIT + 1 + index}
        {...task}
        disableAnimations={isDragging}
      />
    )}
    noTasksMessage="No tasks here. Good job!"
  />
);

const mapStateToProps = state => ({
  tasks: getNextTasks(state),
});

export default connect(mapStateToProps)(Next);
