import React from 'react';
import { connect } from 'react-redux';
import withLoadTasks from '../../../hoc/withLoadTasks';

import { getCompletedTasks } from '../../../../modules/tasks';
import { FETCH_PARAMS_COMPLETED } from '../../../../modules/dashboard';
import { COMPLETED } from '../../../../constants/dashboardTabs';

import LoaderWrapper from '../../../ui/LoaderWrapper';
import Task from '../Shared/Task';
import TaskListWorkspace from '../Shared/TaskListWorkspace';

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
  tasks: getCompletedTasks(state),
});

export default withLoadTasks(
  connect(mapStateToProps)(Completed),
  'completed',
  FETCH_PARAMS_COMPLETED,
);
