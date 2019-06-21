import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import {
  Heading, Text, Box,
} from 'rebass';
import {
  completeTask as completeTaskAction,
} from '../../../modules/tasks';
import { EDIT_TASK } from '../../../constants/paths';
import CheckIcon from '../../icons/CheckIcon';

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

const Task = ({
  id, title, score, scheduledStart, due, completed, completeTask, history,
}) => {
  const onComplete = (event) => {
    event.stopPropagation();
    completeTask(id);
  };
  return (
    <TaskContainer onClick={() => history.push(EDIT_TASK.replace(/:id\b/, id))}>
      <Box flex={1}>
        <TaskTitle>{title}</TaskTitle>
        <TaskSubtitle>
        Tasket score:
          {' '}
          {score}
        </TaskSubtitle>
        {scheduledStart && (
          <TaskSubtitle mt={1}>
            Scheduled start:
            {' '}
            {new Date(scheduledStart).toLocaleString()}
          </TaskSubtitle>
        )}
        {due && (
          <TaskSubtitle mt={1}>
            Due date:
            {' '}
            {new Date(due).toLocaleString()}
          </TaskSubtitle>
        )}
      </Box>
      <TaskButtons>
        {!completed && (
          <CheckIcon onClick={onComplete} size="small" />
        )}
      </TaskButtons>
    </TaskContainer>
  );
};

const mapDispatchToProps = {
  completeTask: completeTaskAction,
};

export default withRouter(connect(null, mapDispatchToProps)(Task));
