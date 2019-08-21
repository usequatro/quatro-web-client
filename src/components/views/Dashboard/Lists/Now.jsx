import React from 'react';
import { connect } from 'react-redux';

import { getNowTasks } from '../../../../modules/tasks';
import { NOW } from '../../../../constants/dashboardTabs';

import Task from '../Shared/Task';
import TaskListWorkspace from '../Shared/TaskListWorkspace';

const Now = ({ tasks }) => (
  <TaskListWorkspace
    taskListId={NOW}
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

const mapStateToProps = (state) => ({
  tasks: getNowTasks(state),
});

export default connect(mapStateToProps)(Now);
