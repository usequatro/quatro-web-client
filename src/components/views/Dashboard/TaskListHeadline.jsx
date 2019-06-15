import React from 'react';
import PropTypes from 'prop-types';
import { Heading } from 'rebass';

const TaskListHeadline = ({ title, count }) => (
  <Heading fontSize={2} mb={2} color="textHighlight">
    {title}
    {' '}
      (
    {count}
      )
  </Heading>
);

TaskListHeadline.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

export default TaskListHeadline;
