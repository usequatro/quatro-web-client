import React from 'react';
import TasksView from '../TasksView';

const sections = [
  {
    title: 'Top Priority',
    count: 1,
    tasks: [
      { title: 'Tasket Wires', score: 180 },
    ],
  },
  {
    title: 'Next',
    count: 2,
    tasks: [
      { title: 'Reach out to Bruce Wayne', score: 101 },
      { title: 'Check email', score: 97 },
    ],
  },
];

export default () => (
  <TasksView
    sections={sections}
  />
);
