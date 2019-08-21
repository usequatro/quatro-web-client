import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import Dropdown from '../../../ui/Dropdown';
import { getTasksForDependencySelection } from '../../../../modules/tasks';
import { TASK, FREE_TEXT } from '../../../../constants/dependencyTypes';

const FREE_TEXT_VALUE = '_freeText';

const WidthVariableDropdown = styled(Dropdown)`
  width: ${(props) => (props.currentDependencyType === FREE_TEXT ? '10rem' : '100%')};
  transition: width 250ms ease;
`;

const DependencySelectorField = ({
  selectedId, className, onChange, currentTaskViewedId, currentDependencyType,
}) => {
  const tasks = useSelector((state) => getTasksForDependencySelection(state, currentTaskViewedId));

  const handleChange = (event, value) => {
    const dependencyType = value === FREE_TEXT_VALUE ? FREE_TEXT : TASK;
    const newValue = dependencyType === TASK ? value : '';
    onChange(dependencyType, newValue);
  };
  return (
    <WidthVariableDropdown
      className={className}
      value={selectedId}
      onChange={handleChange}
      currentDependencyType={currentDependencyType}
    >
      <Dropdown.Option key={FREE_TEXT_VALUE} value={FREE_TEXT_VALUE}>
        [Free text]
      </Dropdown.Option>
      {tasks.map((task) => (
        <Dropdown.Option key={task.id} value={task.id}>
          {task.title}
        </Dropdown.Option>
      ))}
    </WidthVariableDropdown>
  );
};

export default DependencySelectorField;
