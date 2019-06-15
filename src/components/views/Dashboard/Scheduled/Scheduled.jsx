import React from 'react';
import { connect } from 'react-redux';

import { getScheduledTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';

const Scheduled = ({ tasks }) => (
  <React.Fragment>
    <SearchTaskInput />
    <TaskListHeadline title="Scheduled" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
  </React.Fragment>
);

const mapStateToProps = state => ({
  tasks: getScheduledTasks(state),
});

export default connect(mapStateToProps)(Scheduled);
