import React from 'react';
import { connect } from 'react-redux';

import { getBlockedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import TaskListWorkspace from '../TaskListWorkspace';

const Blocked = ({ tasks }) => (
  <TaskListWorkspace
    taskListId="completed"
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        {...task}
        showBlocked
        disableAnimations={isDragging}
      />
    )}
    noTasksMessage="No blockers. Good job!"
  />
);

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
