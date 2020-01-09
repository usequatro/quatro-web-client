import React from 'react';
import { connect } from 'react-redux';

import { selectNowTasks } from 'modules/tasks';
import { NOW } from 'constants/dashboardTabs';

import Task from 'components/views/Dashboard/Shared/Task';
import TaskListWorkspace from 'components/views/Dashboard/Shared/TaskListWorkspace';

const Now = ({ tasks }) => (
  <TaskListWorkspace
    taskListId={NOW}
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        ranking={index + 1}
        disableAnimations={isDragging}
        enableDragHint
        {...task}
      />
    )}
    noTasksMessage="Nothing to do yet! Good job!"
  />
);

const mapStateToProps = (state) => ({
  tasks: selectNowTasks(state),
});

export default connect(mapStateToProps)(Now);
