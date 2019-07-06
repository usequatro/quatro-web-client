import React from 'react';
import { connect } from 'react-redux';

import { getNowTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';

const Now = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Now" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
    {tasks.length === 0 && (
      <p>No tasks. Good job!</p>
    )}
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getNowTasks(state),
});

export default connect(mapStateToProps)(Now);
