import React from 'react';
import { connect } from 'react-redux';

import { getNextTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import Workspace from '../Workspace';
import EndOfListSpacing from '../EndOfListSpacing';
import NOW_TASKS_LIMIT from '../../../../constants/nowTasksLimit';

const Next = ({ tasks }) => (
  <Workspace>
    <SearchTaskInput />
    <TaskListHeadline title="Next" count={tasks.length} />
    {tasks.map((task, index) => (
      <Task key={task.id} ranking={NOW_TASKS_LIMIT + 1 + index} {...task} />
    ))}
    {tasks.length === 0 && (
      <p>No tasks. Good job!</p>
    )}
    <EndOfListSpacing />
  </Workspace>
);

const mapStateToProps = state => ({
  tasks: getNextTasks(state),
});

export default connect(mapStateToProps)(Next);
