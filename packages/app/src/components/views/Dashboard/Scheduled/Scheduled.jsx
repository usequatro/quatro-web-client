import React from 'react';
import TasksView from '../TasksView';

const sections = [
  {
    title: 'Scheduled',
    count: 0,
    tasks: [],
  },
];

export default () => (
  <TasksView
    sections={sections}
  />
);
