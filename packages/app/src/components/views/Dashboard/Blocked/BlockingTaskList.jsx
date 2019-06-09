import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Box } from 'rebass';

import { getBlockingTasks } from '../../../../modules/tasks';

import Task from '../Task';

const Blocked = ({ tasks }) => (
  <Box pl={4}>
    {tasks.map(task => <Task key={task.id} {...task} />)}
  </Box>
);
Blocked.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = (state, props) => ({
  tasks: getBlockingTasks(state, props.blockedTaskId),
});

export default connect(mapStateToProps)(Blocked);
