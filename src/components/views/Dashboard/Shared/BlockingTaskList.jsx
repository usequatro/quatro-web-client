import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box } from 'rebass';

import { getTasksBlockingGivenTask } from '../../../../modules/tasks';

const List = styled(Box).attrs({
  mt: 2,
  ml: 4,
  as: 'ul',
})`
  list-style-type: circle;
`;
const SmallerText = styled.span`
  font-size: 0.9em;
`;

const BlockingTaskList = ({ tasks }) => (
  <Box mt={3}>
    <SmallerText>Blocked by:</SmallerText>
    <List>
      {tasks.map(task => (
        <li key={task.id}>
          <SmallerText>
            {task.title}
          </SmallerText>
        </li>
      ))}
    </List>
  </Box>
);

const mapStateToProps = (state, props) => ({
  tasks: getTasksBlockingGivenTask(state, props.taskId),
});

export default connect(mapStateToProps)(BlockingTaskList);
