import React from 'react';
import { connect } from 'react-redux';

import { getScheduledTasks } from '../../../../modules/tasks';

import Task from '../Task';
import TaskListWorkspace from '../TaskListWorkspace';

const Scheduled = ({ tasks }) => (
  <TaskListWorkspace
    taskListId="scheduled"
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        key={task.id}
        {...task}
        disableAnimations={isDragging}
      />
    )}
    noTasksMessage="No scheduled tasks"
  />
);

const mapStateToProps = state => ({
  tasks: getScheduledTasks(state),
});

export default connect(mapStateToProps)(Scheduled);
