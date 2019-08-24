import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass';

import { selectDependenciesBlockingGivenTask } from '../../../../modules/tasks';
import { TASK, FREE_TEXT } from '../../../../constants/dependencyTypes';
import activeLighter from '../../../style-mixins/activeLighter';
import keyboardOnlyOutline from '../../../style-mixins/keyboardOnlyOutline';

const List = styled(Box).attrs({
  mt: 1,
  ml: 0,
  as: 'ul',
})`
  list-style-type: none;
  line-height: 1.25;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;
const SmallerText = styled.span`
  font-size: 0.9em;
`;
const ListItem = styled(Box).attrs({
  p: 3,
  as: 'button',
})`
  font-size: inherit;
  text-align: left;
  background-color: ${(props) => props.theme.colors.appForeground};
  border: solid ${(props) => props.theme.colors.borderLight} 1px;
  border-radius: 1rem;

  &:hover {
    background-color: ${(props) => props.theme.colors.foregroundOptionHover};
  }

  ${activeLighter}
  ${(props) => keyboardOnlyOutline(props.theme.colors.textHighlight)};

  cursor: pointer;
`;

const TaskBlocker = (dependency, task) => <SmallerText>{task.title}</SmallerText>;
const FreeTextBlocker = (dependency) => <SmallerText>{dependency.config.value}</SmallerText>;

const BlockerViewByType = {
  [TASK]: TaskBlocker,
  [FREE_TEXT]: FreeTextBlocker,
  default: (dependency) => `Unknown dependency type ${dependency.type}`,
};

const BlockingTaskList = ({ taskId }) => {
  const dependenciesAndTasks = useSelector((state) => (
    selectDependenciesBlockingGivenTask(state, taskId)
  ));
  return (
    <Box mt={3}>
      <List>
        {dependenciesAndTasks.map(([dependency, task]) => (
          <ListItem
            key={dependency.id}
          >
            {(BlockerViewByType[dependency.type] || BlockerViewByType.default)(dependency, task)}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BlockingTaskList;
