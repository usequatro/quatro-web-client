import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  Heading, Text, Box,
} from 'rebass';
import {
  deleteTask as deleteTaskAction,
  completeTask as completeTaskAction,
} from '../../../modules/tasks';

const TaskContainer = styled(Box).attrs({ mb: 3, p: 3 })`
  padding: 1rem;
  border: solid 1px ${props => props.theme.colors.border};
  display: flex;
`;

const TaskTitle = props => <Heading {...props} as="h4" fontSize={2} mb={2} />;
const TaskSubtitle = props => <Text {...props} fontSize={2} mb={1} />;

const TaskButtons = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;
const TaskComplete = styled.button`
  height: 1rem;
  width: 1rem;
  background-color: green;
  margin-bottom: 0.5rem;
`;
const TaskDelete = styled(TaskComplete)`
  background-color: orange;
`;

const Task = ({
  id, title, score, scheduledStart, completed, completeTask, deleteTask,
}) => (
  <TaskContainer>
    <Box flex={1}>
      <TaskTitle>{title}</TaskTitle>
      <TaskSubtitle>
        Tasket score:
        {' '}
        {score}
      </TaskSubtitle>
      {scheduledStart && (
        <TaskSubtitle>
          Scheduled start:
          {' '}
          {new Date(scheduledStart).toLocaleString()}
        </TaskSubtitle>
      )}
    </Box>
    <TaskButtons>
      {!completed && (
        <TaskComplete onClick={() => completeTask(id)} />
      )}
      <TaskDelete onClick={() => deleteTask(id)} />
    </TaskButtons>
  </TaskContainer>
);

const mapDispatchToProps = {
  deleteTask: deleteTaskAction,
  completeTask: completeTaskAction,
};

export default connect(null, mapDispatchToProps)(Task);
