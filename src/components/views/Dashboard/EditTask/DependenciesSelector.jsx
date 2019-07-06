import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

import { BLOCKS, BLOCKED_BY } from '../../../../constants/dependencyTypes';

import FieldLabel from '../../../ui/FieldLabel';
import Dropdown from '../../../ui/Dropdown';
import TaskSelectorField from './TaskSelectorField';

const FieldsContainer = styled(Box).attrs({ mb: 3 })`
  display: flex;
  justify-content: space-between;
`;
const DependencyTypeContainer = styled(Box).attrs({ mr: 3 })`
  width: 14rem;
`;
const DeleteButtonContainer = styled(Box).attrs({ ml: 3 })``;

const DependenciesSelector = ({
  taskId, dependencies, updateTaskDependency, removeTaskDependency, createTaskDependency,
}) => {
  const handleChange = (id, blockerId, blockedId) => {
    updateTaskDependency(id, blockerId, blockedId);
  };
  const handleCreate = () => {
    createTaskDependency(taskId, null);
  };

  return (
    <div>
      <FieldLabel>Blockers</FieldLabel>
      {dependencies.map(({ id, blockerId, blockedId }) => {
        const type = taskId === blockerId ? BLOCKS : BLOCKED_BY;
        return (
          <FieldsContainer key={id}>
            <DependencyTypeContainer>
              <Dropdown
                value={type}
                onChange={(_, newType) => handleChange(
                  id,
                  blockedId,
                  blockerId,
                )}
              >
                <Dropdown.Option value={BLOCKS}>blocks</Dropdown.Option>
                <Dropdown.Option value={BLOCKED_BY}>blocked by</Dropdown.Option>
              </Dropdown>
            </DependencyTypeContainer>
            <TaskSelectorField
              selectedId={type === BLOCKS ? blockedId : blockerId}
              currentId={taskId}
              onChange={newId => handleChange(
                id,
                type === BLOCKS ? taskId : newId,
                type === BLOCKED_BY ? taskId : newId,
              )}
            />
            <DeleteButtonContainer>
              <button type="button" onClick={() => removeTaskDependency(id)}>X</button>
            </DeleteButtonContainer>
          </FieldsContainer>
        );
      })}

      <button type="button" onClick={handleCreate}>New</button>
    </div>
  );
};

export default DependenciesSelector;
