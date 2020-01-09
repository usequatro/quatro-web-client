import React from 'react';
import { connect } from 'react-redux';

import { selectScheduledTasks } from 'modules/tasks';
import { SCHEDULED } from 'constants/dashboardTabs';

import Task from 'components/views/Dashboard/Shared/Task';
import TaskListWorkspace from 'components/views/Dashboard/Shared/TaskListWorkspace';

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
  tasks: selectScheduledTasks(state),
});

export default connect(mapStateToProps)(Scheduled);
