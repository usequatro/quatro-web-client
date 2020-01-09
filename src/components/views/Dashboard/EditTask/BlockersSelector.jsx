import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import uuid from 'uuid/v4';

import * as dependencyTypes from 'constants/dependencyTypes';
import ButtonInline from 'components/ui/ButtonInline';
import InputField from 'components/ui/InputField';
import BooleanCheckbox from 'components/ui/BooleanCheckbox';

import DependencySelectorField from './DependencySelectorField';

const BlockerContainer = styled(Box).attrs({ mt: 2 })``;

const FieldsContainer = styled(Box).attrs({ mb: 3 })`
  display: flex;
  justify-content: space-between;
`;
const DeleteButtonContainer = styled(Box)`
  display: flex;
  text-align: center;
  margin-left: 1rem;
`;
const FreeTextInputField = styled(InputField)`
  flex-grow: 1;
  margin-left: 1rem;
`;

const hasValidDependencies = (dependencies) => dependencies.reduce((memo, dependency) => (
  memo
  || (dependency.type === dependencyTypes.FREE_TEXT && dependency.config.value !== '')
  || (dependency.type === dependencyTypes.TASK && dependency.config.taskId != null)
), false);

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

  const [checked, setChecked] = useState(dependencies.length > 0);

  return (
    <BlockerContainer>
      {dependencies.map((dependency) => (
        <FieldsContainer key={dependency.id} dependencyType={dependency.type}>
          <DependencySelectorField
            selectedId={dependency.config.taskId}
            currentTaskViewedId={taskId}
            currentDependencyType={dependency.type}
            onChange={(type, newId) => handleChange(dependency.id, type, newId)}
          />
          {dependency.type === dependencyTypes.FREE_TEXT && (
            <FreeTextInputField
              value={dependency.config.value}
              onChange={(event) => handleFreeTextValueChange(dependency.id, event.target.value)}
            />
          )}
          <DeleteButtonContainer>
            <ButtonInline onClick={() => removeTaskDependency(dependency.id)}>X</ButtonInline>
          </DeleteButtonContainer>
        </FieldsContainer>
      ))}

      <ButtonInline onClick={handleCreate}>Add new</ButtonInline>
    </BlockerContainer>
  );
};

export default BlockersSelector;
