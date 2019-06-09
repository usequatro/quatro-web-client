import React from 'react';
import TasksView from '../TasksView';

const sections = [
  {
    title: 'Completed',
    count: 0,
    tasks: [],
  },
];

export default () => (
  <TasksView
    sections={sections}
  />
);
