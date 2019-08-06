import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import uuid from 'uuid/v4';

import * as dependencyTypes from '../../../../constants/dependencyTypes';
import FieldLabel from '../../../ui/FieldLabel';
import InlineButton from '../../../ui/InlineButton';
import DependencySelectorField from './DependencySelectorField';
import InputField from '../../../ui/InputField';

const FieldsContainer = styled(Box).attrs({ mb: 3 })`
  display: flex;
  justify-content: space-between;
`;
const DeleteButtonContainer = styled(Box).attrs({ ml: 3 })`
  display: flex;
  text-align: center;
`;

const BlockersSelector = ({
  taskId, dependencies, updateTaskDependency, removeTaskDependency, createTaskDependency,
}) => {
  const handleChange = (id, type, value) => {
    if (type === dependencyTypes.TASK) {
      updateTaskDependency(id, {
        type,
        taskId,
        config: {
          taskId: value,
        },
      });
    } else if (type === dependencyTypes.FREE_TEXT) {
      updateTaskDependency(id, {
        type,
        taskId,
        config: {
          value,
        },
      });
    } else {
      throw new Error(`Unsupported dependency type "${type}"`);
    }
  };
  const handleCreate = () => {
    createTaskDependency({
      id: `_${uuid()}`,
      type: dependencyTypes.TASK,
      taskId,
      config: {
        taskId: null,
      },
    });
  };
  const handleFreeTextValueChange = (id, value) => {
    updateTaskDependency(id, {
      type: dependencyTypes.FREE_TEXT,
      taskId,
      config: {
        value,
      },
    });
  };

  return (
    <div>
      <FieldLabel>Blocked by</FieldLabel>
      {dependencies.map(dependency => (
        <FieldsContainer key={dependency.id} dependencyType={dependency.type}>
          <DependencySelectorField
            selectedId={dependency.config.taskId}
            currentTaskViewedId={taskId}
            currentDependencyType={dependency.type}
            onChange={(dependencyType, newId) => handleChange(dependency.id, dependencyType, newId)}
          />
          {dependency.type === dependencyTypes.FREE_TEXT && (
            <InputField
              value={dependency.config.value}
              onChange={event => handleFreeTextValueChange(dependency.id, event.target.value)}
            />
          )}
          <DeleteButtonContainer>
            <InlineButton onClick={() => removeTaskDependency(dependency.id)}>X</InlineButton>
          </DeleteButtonContainer>
        </FieldsContainer>
      ))}

      <InlineButton onClick={handleCreate}>Add new</InlineButton>
    </div>
  );
};

export default BlockersSelector;
