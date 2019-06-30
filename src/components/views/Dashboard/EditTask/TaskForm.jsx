import React from 'react';
import memoize from 'lodash/memoize';

import InputGroup from '../../../ui/InputGroup';
import InputField from '../../../ui/InputField';
import HorizontalSelectorField from '../../../ui/HorizontalSelectorField';
import DateTimeField from '../../../ui/DateTimeField';
import BooleanCheckbox from '../../../ui/BooleanCheckbox';

const generateConsecutiveOptions = memoize((min, max) => {
  const array = Array.from(Array(max).keys());
  return array.map((value, index) => ({
    value: (min + index),
  }));
}, (min, max) => `${min}-${max}`);

const TaskForm = ({
  title,
  setTitle,
  impact,
  setImpact,
  effort,
  setEffort,
  description,
  setDescription,
  due,
  setDue,
  hasDue,
  setHasDue,
  scheduledStart,
  setScheduledStart,
  hasScheduledStart,
  setHasScheduledStart,
}) => (
  <InputGroup mb={4}>
    <InputField
      required
      label="What do you have to do? *"
      value={title}
      onChange={event => setTitle(event.target.value)}
    />
    <HorizontalSelectorField
      label="How important is this task?"
      value={impact}
      onChange={(event, value) => setImpact(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <HorizontalSelectorField
      label="How much effort will it require?"
      value={effort}
      onChange={(event, value) => setEffort(value)}
      options={generateConsecutiveOptions(1, 7)}
    />
    <InputField
      textarea
      label="Notes"
      value={description}
      onChange={event => setDescription(event.target.value)}
    />

    <DateTimeField
      label={(
        <label>
          <BooleanCheckbox
            onChange={(event, value) => {
              setHasDue(value);
              setDue(null);
            }}
            value={hasDue}
          />
            Due Date
        </label>
      )}
      onChange={(event, value) => setDue(value)}
      value={due}
      disabled={!hasDue}
    />

    <DateTimeField
      label={(
        <label>
          <BooleanCheckbox
            onChange={(event, value) => {
              setHasScheduledStart(value);
              setScheduledStart(null);
            }}
            value={hasScheduledStart}
          />
            Scheduled Start Date
        </label>
      )}
      onChange={(event, value) => setScheduledStart(value)}
      value={scheduledStart}
      disabled={!hasScheduledStart}
    />
  </InputGroup>
);

export default TaskForm;
