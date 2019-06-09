import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getBlockedTasks } from '../../../../modules/tasks';

import Task from '../Task';
import SearchTaskInput from '../SearchTaskInput';
import TaskListHeadline from '../TaskListHeadline';
import BlockingTaskList from './BlockingTaskList';

const Blocked = ({ tasks }) => (
  <React.Fragment>
    <SearchTaskInput />
    <TaskListHeadline title="Blocked" count={tasks.length} />
    {tasks.map(task => (
      <React.Fragment key={task.id}>
        <Task {...task} />
        <BlockingTaskList blockedTaskId={task.id} />
      </React.Fragment>
    ))}
  </React.Fragment>
);
Blocked.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  tasks: getBlockedTasks(state),
});

export default connect(mapStateToProps)(Blocked);
