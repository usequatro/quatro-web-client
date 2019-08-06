import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass';

import { getDependenciesBlockingGivenTask } from '../../../../modules/tasks';
import { TASK, FREE_TEXT } from '../../../../constants/dependencyTypes';

const List = styled(Box).attrs({
  mt: 2,
  ml: 4,
  as: 'ul',
})`
  list-style-type: circle;
  line-height: 1.25;
`;
const SmallerText = styled.span`
  font-size: 0.9em;
`;

const TaskBlocker = (dependency, task) => <SmallerText>{task.title}</SmallerText>;
const FreeTextBlocker = dependency => <SmallerText>{dependency.config.value}</SmallerText>;

const BlockerViewByType = {
  [TASK]: TaskBlocker,
  [FREE_TEXT]: FreeTextBlocker,
  default: dependency => `Unknown dependency type ${dependency.type}`,
};

const BlockingTaskList = ({ taskId }) => {
  const dependenciesAndTasks = useSelector(state => (
    getDependenciesBlockingGivenTask(state, taskId)
  ));
  return (
    <Box mt={3}>
      <SmallerText>Blocked by:</SmallerText>
      <List>
        {dependenciesAndTasks.map(([dependency, task]) => (
          <li key={dependency.id}>
            {(BlockerViewByType[dependency.type] || BlockerViewByType.default)(dependency, task)}
          </li>
        ))}
      </List>
    </Box>
  );
};

export default BlockingTaskList;
