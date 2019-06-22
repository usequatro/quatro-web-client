import React from 'react';
import { connect } from 'react-redux';

import { getImportantTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';

const Important = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Important" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
    {tasks.length === 0 && (
      <p>No tasks. Good job!</p>
    )}
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getImportantTasks(state),
});

export default connect(mapStateToProps)(Important);
