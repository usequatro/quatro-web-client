import React, { useState } from 'react';
import styled from 'styled-components';
import memoize from 'lodash/memoize';
import dayjs from 'dayjs';

import InputGroup from '../../../ui/InputGroup';
import InputField from '../../../ui/InputField';
import Dropdown from '../../../ui/Dropdown';
import HorizontalSelectorField from '../../../ui/HorizontalSelectorField';
import ToggleableFieldWrapper from '../../../ui/ToggleableFieldWrapper';
import DateTimeField from '../../../ui/DateTimeField';
import Paragraph from '../../../ui/Paragraph';
import BlockersSelector from './BlockersSelector';
import ButtonInline from '../../../ui/ButtonInline';
import RecurringPopup from './RecurringPopup';

import {
  getRecurringPresetFromConfig,
  RECURRING_CONFIG_EVERY_MONDAY,
  RECURRING_CONFIG_EVERY_WEEKDAY,
  NO_RECURRENCE_OPTION,
  EVERY_MONDAY_OPTION,
  WEEKDAYS_OPTION,
  CUSTOM_OPTION,
} from '../../../../util/recurrence';

const Italic = styled.span`
  font-style: italic;
`;

const generateConsecutiveOptions = memoize((min, max) => {
  const array = Array.from(Array(max).keys());
  return array.map((value, index) => ({
    value: (min + index),
  }));
}, (min, max) => `${min}-${max}`);

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(17)
  .startOf('hour')
  .valueOf();

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
  recurringConfig,
  setRecurringConfig,
}) => {
  const [recurringPopupVisible, setRecurringPopupVisible] = useState(false);
  const selectedRecurringOption = getRecurringPresetFromConfig(recurringConfig);

  return (
    <>
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
            <ButtonInline onClick={() => clearRelativePrioritization(id)}>
              Clear customization
            </ButtonInline>
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
        <ToggleableFieldWrapper
          label="Due Date"
          helpText="Does it need to be complete by a certain date?"
          defaultChecked={due != null && due !== ''}
          onChange={(event, checked) => setDue(checked ? getInitialDueDate() : null)}
        >
          <DateTimeField
            value={due}
            onChange={(event, newDateTime) => setDue(newDateTime)}
          />
        </ToggleableFieldWrapper>
        <ToggleableFieldWrapper
          label="Scheduled Start Date"
          helpText="Do you want to delay starting this task?"
          defaultChecked={scheduledStart != null && scheduledStart !== ''}
          onChange={(event, checked) => setScheduledStart(checked ? getInitialDueDate() : null)}
        >
          <DateTimeField
            value={scheduledStart}
            onChange={(event, newDateTime) => setScheduledStart(newDateTime)}
          />
        </ToggleableFieldWrapper>
        <ToggleableFieldWrapper
          label="Recurrence"
          helpText="Do you need to do this multiple times?"
          defaultChecked={selectedRecurringOption !== ''}
          onChange={(event, checked) => {
            if (!checked) {
              setRecurringConfig(null);
            }
          }}
        >
          <Dropdown
            value={selectedRecurringOption}
            onChange={(event, value) => {
              const recurringDropdownActions = {
                [NO_RECURRENCE_OPTION]: () => setRecurringConfig(null),
                [CUSTOM_OPTION]: () => setRecurringPopupVisible(true),
                [EVERY_MONDAY_OPTION]: () => setRecurringConfig(RECURRING_CONFIG_EVERY_MONDAY),
                [WEEKDAYS_OPTION]: () => setRecurringConfig(RECURRING_CONFIG_EVERY_WEEKDAY),
              };
              (recurringDropdownActions[value] || (() => {}))();
            }}
          >
            <Dropdown.Option value={NO_RECURRENCE_OPTION}>
              {selectedRecurringOption === NO_RECURRENCE_OPTION ? '' : 'Not recurring'}
            </Dropdown.Option>
            <Dropdown.Option value={EVERY_MONDAY_OPTION}>Every Monday</Dropdown.Option>
            <Dropdown.Option value={WEEKDAYS_OPTION}>
              Every weekday (Monday to Friday)
            </Dropdown.Option>
            <Dropdown.Option value={CUSTOM_OPTION}>Custom...</Dropdown.Option>
          </Dropdown>
        </ToggleableFieldWrapper>
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

      <RecurringPopup
        open={recurringPopupVisible}
        onClose={() => setRecurringPopupVisible(false)}
        onDone={(value) => setRecurringConfig(value)}
      />
    </>
  );
};

export default TaskForm;
