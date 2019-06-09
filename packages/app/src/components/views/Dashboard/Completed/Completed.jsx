import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getCompletedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';

const Completed = ({ tasks }) => (
  <React.Fragment>
    <SearchTaskInput />
    <TaskListHeadline title="Completed" count={tasks.length} />
    {tasks.map(task => <Task key={task.id} {...task} />)}
  </React.Fragment>
);
Completed.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  tasks: getCompletedTasks(state),
});

export default connect(mapStateToProps)(Completed);
