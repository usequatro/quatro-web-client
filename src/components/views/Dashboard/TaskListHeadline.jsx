import React from 'react';
import { Heading } from 'rebass';

const TaskListHeadline = ({ title, count }) => (
  <Heading fontSize={2} mb={2} color="textHighlight" fontFamily="headline">
    {title}
    {' '}
      (
    {count}
      )
  </Heading>
);

export default TaskListHeadline;
