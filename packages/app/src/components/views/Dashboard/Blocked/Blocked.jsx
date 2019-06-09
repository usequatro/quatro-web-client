import React from 'react';
import TasksView from '../TasksView';

const sections = [
  {
    title: 'Blocked',
    count: 0,
    tasks: [],
  },
];

export default () => (
  <TasksView
    sections={sections}
  />
);
