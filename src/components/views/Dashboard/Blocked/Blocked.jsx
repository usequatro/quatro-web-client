import React from 'react';
import { connect } from 'react-redux';

import { getBlockedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';
import NoTasksView from '../NoTasksView';

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
      <NoTasksView message="No blockers. Good job!" />
    )}
    <EndOfListSpacing />
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
