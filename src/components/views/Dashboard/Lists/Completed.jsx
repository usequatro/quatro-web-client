import React from 'react';
import { connect } from 'react-redux';

import { selectCompletedTasks } from 'modules/tasks';
import { COMPLETED } from 'constants/dashboardTabs';

import withLoadTasks from 'components/hoc/withLoadTasks';
import LoaderWrapper from 'components/ui/LoaderWrapper';

import Task from 'components/views/Dashboard/Shared/Task';
import TaskListWorkspace from 'components/views/Dashboard/Shared/TaskListWorkspace';

const Completed = ({ tasks, loaded }) => (
  <LoaderWrapper loading={!loaded}>
    <TaskListWorkspace
      taskListId={COMPLETED}
      tasks={tasks}
      renderTask={(task, index, isDragging) => (
        <Task
          key={task.id}
          {...task}
          disableAnimations={isDragging}
        />
      )}
      noTasksMessage="No completed tasks yet. Get to work!"
      isDragDisabled
    />
  </LoaderWrapper>
);

const mapStateToProps = (state) => ({
  tasks: selectCompletedTasks(state),
});

export default withLoadTasks(
  connect(mapStateToProps)(Completed),
  'completed',
);
