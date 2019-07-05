import React from 'react';
import { connect } from 'react-redux';

import Dropdown from '../../../ui/Dropdown';
import { getTasksForDependencySelection } from '../../../../modules/tasks';

const TaskSelectorField = ({
  selectedId, tasks, className, onChange,
}) => (
  <Dropdown className={className} value={selectedId} onChange={(event, newId) => onChange(newId)}>
    {tasks.map(task => (
      <Dropdown.Option key={task.id} value={task.id}>
        {task.title}
      </Dropdown.Option>
    ))}
  </Dropdown>
);

const mapStateToProps = (state, ownProps) => ({
  tasks: getTasksForDependencySelection(state, ownProps.currentId),
});

export default connect(mapStateToProps)(TaskSelectorField);
