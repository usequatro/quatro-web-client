import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Heading } from 'rebass';
import SearchTaskInput from './SearchTaskInput';
import Task from './Task';

const TaskListHeadline = styled(Heading).attrs({
  fontSize: 2,
  color: 'textHighlight',
})`
    margin-bottom: 0.5rem;
`;

const TasksView = ({ sections }) => (
  <React.Fragment>
    <SearchTaskInput />
    {sections.map(({ title, count, tasks }) => (
      <div>
        <TaskListHeadline>
          {title}
          {' '}
          (
          {count}
          )
        </TaskListHeadline>
        {tasks.map(task => <Task {...task} />)}
      </div>
    ))}
  </React.Fragment>
);

TasksView.propTypes = {
  sections: PropTypes.shape({
    title: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    tasks: PropTypes.array,
  }).isRequired,
};

export default TasksView;
