import React from 'react';
import { connect } from 'react-redux';

import { getNowTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';
import NoTasksView from '../NoTasksView';

const Now = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Now" count={tasks.length} />
    {tasks.map((task, index) => <Task key={task.id} ranking={index + 1} {...task} />)}
    {tasks.length === 0 && (
      <NoTasksView message="Nothing to do yet! Good job!" />
    )}
    <EndOfListSpacing />
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getNowTasks(state),
});

export default connect(mapStateToProps)(Now);
