import React from 'react';
import styled from 'styled-components';
import memoize from 'lodash/memoize';

import InputGroup from '../../../ui/InputGroup';
import InputField from '../../../ui/InputField';
import HorizontalSelectorField from '../../../ui/HorizontalSelectorField';
import ToggleableDateTimeField from '../../../ui/ToggleableDateTimeField';
import Paragraph from '../../../ui/Paragraph';
import BlockersSelector from './BlockersSelector';
import InlineButton from '../../../ui/InlineButton';

const Italic = styled.span`
  font-style: italic;
`;

const generateConsecutiveOptions = memoize((min, max) => {
  const array = Array.from(Array(max).keys());
  return array.map((value, index) => ({
    value: (min + index),
  }));
}, (min, max) => `${min}-${max}`);

const TaskForm = ({
  id,
  title,
  setTitle,
  impact,
  setImpact,
  effort,
  setEffort,
  description,
  setDescription,
  due,
  taskPrioritizedAheadOfTitle,
  setDue,
  scheduledStart,
  setScheduledStart,
  dependencies,
  updateTaskDependency,
  removeTaskDependency,
  createTaskDependency,
  clearRelativePrioritization,
}) => (
  <InputGroup mb={4}>
    <InputField
      required
      label="Summary *"
      helpText="What do you have to do?"
      value={title}
      onChange={(event) => setTitle(event.target.value)}
    />
    {taskPrioritizedAheadOfTitle && (
      <Paragraph>
        {'⚠️ This task is manually prioritized to be before '}
        <Italic>{taskPrioritizedAheadOfTitle}</Italic>
        {'.'}
        <InlineButton onClick={() => clearRelativePrioritization(id)}>
          Clear customization
        </InlineButton>
      </Paragraph>
    )}
    <HorizontalSelectorField
      label="Impact *"
      helpText="How important is this task?"
      required
      value={impact}
      hiddenInputProps={{ type: 'number', min: 1, max: 7 }}
      onChange={(event, value) => setImpact(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <HorizontalSelectorField
      label="Effort *"
      helpText="How much effort will this task require?"
      required
      value={effort}
      hiddenInputProps={{ type: 'number', min: 1, max: 7 }}
      onChange={(event, value) => setEffort(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <ToggleableDateTimeField
      label="Due Date"
      helpText="Does it need to be complete by a certain date?"
      value={due}
      onChange={(event, value) => setDue(value)}
    />
    <ToggleableDateTimeField
      label="Scheduled Start Date"
      helpText="Do you want to delay starting this task?"
      value={scheduledStart}
      onChange={(event, value) => setScheduledStart(value)}
    />
    <BlockersSelector
      taskId={id}
      dependencies={dependencies}
      updateTaskDependency={updateTaskDependency}
      removeTaskDependency={removeTaskDependency}
      createTaskDependency={createTaskDependency}
    />
    <InputField
      textarea
      label="Notes"
      value={description}
      onChange={(event) => setDescription(event.target.value)}
    />
  </InputGroup>
);

export default TaskForm;
