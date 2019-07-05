import React from 'react';
import { connect } from 'react-redux';

import Dropdown from '../../../ui/Dropdown';
import { getTasksForDependencySelection } from '../../../../modules/tasks';

const TaskSelectorField = ({
  id, tasks, className, onChange,
}) => (
  <Dropdown className={className} value={id} onChange={(event, newId) => onChange(newId)}>
    {tasks.map(task => (
      <Dropdown.Option value={task.id}>{task.title}</Dropdown.Option>
    ))}
  </Dropdown>
);

const mapStateToProps = (state, ownProps) => ({
  tasks: getTasksForDependencySelection(state, ownProps.id),
});

export default connect(mapStateToProps)(TaskSelectorField);
