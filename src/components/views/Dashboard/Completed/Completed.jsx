import React from 'react';
import { connect } from 'react-redux';
import withLoadTasks from '../../../hoc/withLoadTasks';

import { getCompletedTasks } from '../../../../modules/tasks';
import { FETCH_PARAMS_COMPLETED } from '../../../../modules/dashboard';

import LoaderWrapper from '../../../ui/LoaderWrapper';
import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';
import NoTasksView from '../NoTasksView';

const Completed = ({ tasks, loaded }) => (
  <LoaderWrapper loading={!loaded}>
    <Workspace>
      <SearchTaskInput />
      <TaskListHeadline title="Completed" count={tasks.length} />
      {tasks.map(task => <Task key={task.id} {...task} />)}
      {tasks.length === 0 && (
        <NoTasksView message="No completed tasks yet. Get to work!" />
      )}
      <EndOfListSpacing />
    </Workspace>
  </LoaderWrapper>
);

const mapStateToProps = state => ({
  tasks: getCompletedTasks(state),
});

export default withLoadTasks(
  connect(mapStateToProps)(Completed),
  'completed',
  FETCH_PARAMS_COMPLETED,
);
