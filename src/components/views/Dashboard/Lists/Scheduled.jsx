import React from 'react';
import { connect } from 'react-redux';

import { getScheduledTasks } from '../../../../modules/tasks';
import { SCHEDULED } from '../../../../constants/dashboardTabs';

import Task from '../Shared/Task';
import TaskListWorkspace from '../Shared/TaskListWorkspace';

const Scheduled = ({ tasks }) => (
  <TaskListWorkspace
    taskListId={SCHEDULED}
    tasks={tasks}
    renderTask={(task, index, isDragging) => (
      <Task
        key={task.id}
        {...task}
        disableAnimations={isDragging}
      />
    )}
    noTasksMessage="No scheduled tasks"
    isDragDisabled
  />
);

const mapStateToProps = (state) => ({
  tasks: getScheduledTasks(state),
});

export default connect(mapStateToProps)(Scheduled);
