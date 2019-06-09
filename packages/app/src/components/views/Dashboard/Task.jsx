import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Heading, Text, Box } from 'rebass';

const TaskContainer = styled(Box).attrs({ mb: 3, p: 3 })`
    padding: 1rem;
    border: solid 1px ${props => props.theme.colors.border};
`;

const TaskTitle = props => <Heading {...props} as="h4" fontSize={2} mb={2} />;
const TaskSubtitle = props => <Text {...props} fontSize={2} mb={1} />;

const Task = ({ title, score, start }) => (
  <TaskContainer>
    <TaskTitle>{title}</TaskTitle>
    <TaskSubtitle>
      Tasket score:
      {' '}
      {score}
    </TaskSubtitle>
    {start && (
      <TaskSubtitle>
        Scheduled start:
        {' '}
        {new Date(start).toLocaleString()}
      </TaskSubtitle>
    )}
  </TaskContainer>
);

Task.propTypes = {
  title: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  start: PropTypes.number,
};

Task.defaultProps = {
  start: undefined,
};

export default Task;
