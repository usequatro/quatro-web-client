import React from 'react';
import { connect } from 'react-redux';

import { getBlockedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';

const Blocked = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Blocked" count={tasks.length} />
    {tasks.map(task => (
      <React.Fragment key={task.id}>
        <Task {...task} showBlocked />
      </React.Fragment>
    ))}
    {tasks.length === 0 && (
      <p>No tasks. Good job!</p>
    )}
    <EndOfListSpacing />
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
