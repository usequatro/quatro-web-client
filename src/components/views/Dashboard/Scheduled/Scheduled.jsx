import React from 'react';
import { connect } from 'react-redux';

import { getScheduledTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';
import NoTasksView from '../NoTasksView';

const Scheduled = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Scheduled" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
    {tasks.length === 0 && (
      <NoTasksView message="No scheduled tasks" />
    )}
    <EndOfListSpacing />
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getScheduledTasks(state),
});

export default connect(mapStateToProps)(Scheduled);
