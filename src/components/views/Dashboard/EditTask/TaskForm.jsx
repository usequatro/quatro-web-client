import React from 'react';

import InputGroup from '../../../ui/InputGroup';
import InputField from '../../../ui/InputField';
import DateTimeField from '../../../ui/DateTimeField';
import BooleanCheckbox from '../../../ui/BooleanCheckbox';

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
      label="What do you have to do?*"
      value={title}
      onChange={event => setTitle(event.target.value)}
    />
    <InputField
      required
      type="number"
      min={0}
      max={7}
      label="How important is this task?*"
      vaue={impact}
      onChange={event => setImpact(event.target.value)}
    />
    <InputField
      required
      type="number"
      min={0}
      max={7}
      label="How much effort will it require?*"
      value={effort}
      onChange={event => setEffort(event.target.value)}
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
