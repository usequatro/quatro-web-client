import React from 'react';
import memoize from 'lodash/memoize';

import InputGroup from '../../../ui/InputGroup';
import InputField from '../../../ui/InputField';
import HorizontalSelectorField from '../../../ui/HorizontalSelectorField';
import DateTimeField from '../../../ui/DateTimeField';
import BooleanCheckbox from '../../../ui/BooleanCheckbox';
import Paragraph from '../../../ui/Paragraph';
import BlockersSelector from './BlockersSelector';
import InlineButton from '../../../ui/InlineButton';

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
  hasDue,
  setHasDue,
  scheduledStart,
  setScheduledStart,
  hasScheduledStart,
  setHasScheduledStart,
  dependencies,
  updateTaskDependency,
  removeTaskDependency,
  createTaskDependency,
  clearRelativePrioritization,
}) => (
  <InputGroup mb={4}>
    <InputField
      required
      label="What do you have to do? *"
      value={title}
      onChange={(event) => setTitle(event.target.value)}
    />
    {taskPrioritizedAheadOfTitle && (
      <Paragraph>
        {`⚠️ This task is manually prioritized to be before ${taskPrioritizedAheadOfTitle}. `}
        <InlineButton onClick={() => clearRelativePrioritization(id)}>
          Clear customization
        </InlineButton>
      </Paragraph>
    )}
    <HorizontalSelectorField
      label="How important is this task? *"
      required
      value={impact}
      hiddenInputProps={{ type: 'number', min: 1, max: 7 }}
      onChange={(event, value) => setImpact(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <HorizontalSelectorField
      label="How much effort will it require? *"
      required
      value={effort}
      hiddenInputProps={{ type: 'number', min: 1, max: 7 }}
      onChange={(event, value) => setEffort(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <InputField
      textarea
      label="Notes"
      value={description}
      onChange={(event) => setDescription(event.target.value)}
    />

    <DateTimeField
      label={(
        <BooleanCheckbox
          onChange={(event, value) => {
            setHasDue(value);
            setDue(null);
          }}
          value={hasDue}
          label="Due Date"
        />
      )}
      onChange={(event, value) => setDue(value)}
      value={due}
      disabled={!hasDue}
    />

    <DateTimeField
      label={(
        <BooleanCheckbox
          onChange={(event, value) => {
            setHasScheduledStart(value);
            setScheduledStart(null);
          }}
          value={hasScheduledStart}
          label="Scheduled Start Date"
        />
      )}
      onChange={(event, value) => setScheduledStart(value)}
      value={scheduledStart}
      disabled={!hasScheduledStart}
    />

    <BlockersSelector
      taskId={id}
      dependencies={dependencies}
      updateTaskDependency={updateTaskDependency}
      removeTaskDependency={removeTaskDependency}
      createTaskDependency={createTaskDependency}
    />
  </InputGroup>
);

export default TaskForm;
