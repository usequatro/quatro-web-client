import React from 'react';
import { connect } from 'react-redux';

import { getNowTasks } from '../../../../modules/tasks';

import Task from '../Task';
import TaskListWorkspace from '../TaskListWorkspace';

const Now = ({ tasks }) => (
  <TaskListWorkspace
    taskListId="now"
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        ranking={index + 1}
        disableAnimations={isDragging}
        {...task}
      />
    )}
    noTasksMessage="Nothing to do yet! Good job!"
  />
);

const mapStateToProps = state => ({
  tasks: getNowTasks(state),
});

export default connect(mapStateToProps)(Now);
