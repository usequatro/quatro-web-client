import React from 'react';
import { connect } from 'react-redux';

import { getImportantTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';

const Important = ({ tasks }) => (
  <React.Fragment>
    <SearchTaskInput />
    <TaskListHeadline title="Important" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
  </React.Fragment>
);

const mapStateToProps = state => ({
  tasks: getImportantTasks(state),
});

export default connect(mapStateToProps)(Important);
