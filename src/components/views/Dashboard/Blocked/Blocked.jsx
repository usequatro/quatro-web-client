import React from 'react';
import { connect } from 'react-redux';

import { getBlockedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import BlockingTaskList from './BlockingTaskList';
import Workspace from '../Workspace';

const Blocked = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Blocked" count={tasks.length} />
    {tasks.map(task => (
      <React.Fragment key={task.id}>
        <Task {...task} />
        <BlockingTaskList blockedTaskId={task.id} />
      </React.Fragment>
    ))}
    {tasks.length === 0 && (
      <p>No tasks. Good job!</p>
    )}
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
