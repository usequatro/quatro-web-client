import React from 'react';
import { connect } from 'react-redux';

import { getBlockedTasks } from '../../../../modules/tasks';
import { BLOCKED } from '../../../../constants/dashboardTabs';

import Task from '../Task';
import TaskListWorkspace from '../TaskListWorkspace';

const Blocked = ({ tasks }) => (
  <TaskListWorkspace
    taskListId={BLOCKED}
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        {...task}
        showBlocked
        disableAnimations={isDragging}
      />
    )}
    noTasksMessage="No blockers. Good job!"
    isDragDisabled
  />
);

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
