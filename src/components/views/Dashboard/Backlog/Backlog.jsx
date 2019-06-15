import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getBacklogTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';

const Backlog = ({ tasks }) => (
  <React.Fragment>
    <SearchTaskInput />
    <TaskListHeadline title="Backlog" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
  </React.Fragment>
);
Backlog.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  tasks: getBacklogTasks(state),
});

export default connect(mapStateToProps)(Backlog);
