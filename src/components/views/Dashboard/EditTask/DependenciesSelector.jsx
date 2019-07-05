import React from 'react';
import styled from 'styled-components';
import { Box } from 'rebass';

import { BLOCKS, BLOCKED_BY } from '../../../../constants/dependencyTypes';

import FieldLabel from '../../../ui/FieldLabel';
import Dropdown from '../../../ui/Dropdown';
import TaskSelectorField from './TaskSelectorField';

const FieldsContainer = styled(Box)`
  display: flex;
  justify-content: space-between;
`;
const DependencyTypeContainer = styled(Box).attrs({ mr: 3 })`
  width: 10rem;
`;

const DependenciesSelector = ({ dependencies }) => {
  const handleDependencyTypeChange = () => {};
  const handleIdChange = () => {};
  const createDependency = () => {};
  const removeDependency = () => {};

  return (
    <div>
      <FieldLabel>Blockers</FieldLabel>
      {dependencies.map(({ targetId, type }, index) => (
        <FieldsContainer>
          <DependencyTypeContainer>
            <Dropdown
              value={type}
              onChange={(_, newType) => handleDependencyTypeChange(index, newType)}
            >
              <Dropdown.Option value={BLOCKED_BY}>blocked by</Dropdown.Option>
              <Dropdown.Option value={BLOCKS}>blocks</Dropdown.Option>
            </Dropdown>
          </DependencyTypeContainer>
          <TaskSelectorField
            id={targetId}
            onChange={newId => handleIdChange(index, newId)}
          />
          <button type="button" onClick={removeDependency}>X</button>
        </FieldsContainer>
      ))}

      <button type="button" onClick={createDependency}>New</button>
    </div>
  );
};

export default DependenciesSelector;
