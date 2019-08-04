import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';
import uuid from 'uuid/v4';

import FieldLabel from '../../../ui/FieldLabel';
import InlineButton from '../../../ui/InlineButton';
import TaskSelectorField from './TaskSelectorField';

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
  const handleChange = (id, blockedById) => {
    updateTaskDependency(id, {
      type: 'task',
      taskId,
      config: {
        taskId: blockedById,
      },
    });
  };
  const handleCreate = () => {
    createTaskDependency({
      id: `_${uuid()}`,
      type: 'task',
      taskId,
      config: {
        taskId: null,
      },
    });
  };

  return (
    <div>
      <FieldLabel>Blocked by</FieldLabel>
      {dependencies.map(dependency => (
        <FieldsContainer key={dependency.id}>
          <TaskSelectorField
            selectedId={dependency.config.taskId}
            currentTaskViewedId={taskId}
            onChange={newId => handleChange(
              dependency.id,
              newId,
            )}
          />
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
