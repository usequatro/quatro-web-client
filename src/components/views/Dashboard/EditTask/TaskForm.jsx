import React, { useState } from 'react';
import styled from 'styled-components';
// import memoize from 'lodash/memoize';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import { Box } from 'rebass/styled-components';

import {
  getRecurringPresetFromConfig,
  getRecurringOptionLabel,
  RECURRING_CONFIG_EVERY_MONDAY,
  RECURRING_CONFIG_EVERY_WEEKDAY,
  NO_RECURRENCE_OPTION,
  EVERY_MONDAY_OPTION,
  WEEKDAYS_OPTION,
  CUSTOM_OPTION,
} from 'util/recurrence';

// import InputGroup from 'components/ui/InputGroup';
import InputField from 'components/ui/InputField';
import TransparentInputField from 'components/ui/TransparentInputField';
import Dropdown from 'components/ui/Dropdown';
// import HorizontalSelectorField from 'components/ui/HorizontalSelectorField';
// import ToggleableFieldWrapper from 'components/ui/ToggleableFieldWrapper';
import DateTimeField from 'components/ui/DateTimeField';
import Paragraph from 'components/ui/Paragraph';
import ButtonInline from 'components/ui/ButtonInline';
import Slider, { SliderThumb } from 'components/ui/Slider';
import HeadingResponsive from 'components/ui/HeadingResponsive';
// import LeftHandIcon from 'components/icons/LeftHand';
import colorSmoothTransitions from 'components/style-mixins/colorSmoothTransitions';
import { activeOpacity } from 'components/style-mixins/activeLighter';

import BlockersSelector from './BlockersSelector';
import RecurringPopup from './RecurringPopup';

const Italic = styled.span`
  font-style: italic;
`;



const FieldContainer = styled.div`
  background-color: white;
  width: 100%;
  padding: 2rem 1.5rem;
`;

const SliderContainer = styled.div`
  display: flex;
  padding: 0 1rem;
`;

// const SliderHandContainer = styled.div`
//   height: 40px;
//   width: 40px;
//   margin-right: 0.5rem;
// `;

const FlexContainer = styled.div`
  display: flex;
  justify-content: end;
`;

const FieldTitle = styled(HeadingResponsive).attrs({ fontSize: [3] })`
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: ${({ theme }) => theme.letterSpacings.large}
  text-align: center;
  font-weight: bold;
`

const CheckboxFieldTitle = styled(FieldTitle)`
  margin-left: 0.5rem;
  line-height: 1.5rem;
`;

const FieldAlertSubtitle = styled(HeadingResponsive).attrs({ fontSize: [6] })`
  color: ${({ theme }) => theme.colors.textTertiary};
  letter-spacing: ${({ theme }) => theme.letterSpacings.medium};
  padding: 1rem;
`;

const Checkbox = styled.div`
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-style: solid;
  border-color: ${({ checked, theme }) => (checked ? theme.buttons.primary.color : theme.colors.border)};
  border-width: 1px;
  background-color: ${(props) => (props.checked ? props.theme.buttons.primary.backgroundColor : 'transparent')};
  transition: ${colorSmoothTransitions};

  opacity: ${(props) => (props.disabled ? '0.5' : '1')};

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.3rem;
    height: 0.6rem;
    border-style: solid;
    border-width: 0 2px 2px 0;
    border-color: ${(props) => props.theme.buttons.primary.color};
    transform: translate(-50%, -65%) rotate(40deg);
  }

`;

const TopPaddedContainer = styled(Box).attrs({ mt: 2 })``;

const CheckboxInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  &:focus-visible + ${Checkbox} {
    outline: ${(props) => props.theme.colors.textHighlight} auto 2px;
  }
  &:active + ${Checkbox} {
    opacity: ${activeOpacity};
  }
`;

const CheckboxContainer = styled.div`
  position: relative;
  width: 1.5rem;
  height: 1.5rem;
  margin: 0 0.5rem -1px 0;
  flex-shrink: 0;
`;

const CheckboxLabel = styled(Box).attrs({
  as: 'label',
})`
  flex-grow: 1;
  padding: 0.5rem 0;
`;

const FormContainer = styled.div`
  text-align: center;
  ${FieldContainer}:nth-child(even) {
    background-color: ${(props) => props.theme.colors.lightBackground};
    ${Checkbox}::after {
      border-color: ${(props) => props.theme.colors.lightBackground};
    }
  }
`;

const getInitialDueDate = () => dayjs()
  .add(1, 'day')
  .hour(9)
  .startOf('hour')
  .valueOf();

const OPEN_RECURRENCE_MODAL_OPTION = 'openRecurrenceModal';

// How Important Slider constants
const DEFAULT_IMPACT = 5;

const MARKS_IMPORTANT = [
  {
    value: 1,
    label: 'Not Very',
  },
  {
    value: 2,
    label: 'A little',
  },
  {
    value: 3,
    label: 'Somewhat',
  },
  {
    value: 4,
    label: 'Pretty',
  },
  {
    value: 5,
    label: 'Very',
  },
];

const MARKS_IMPORTANT_VALUE_TO_DISPLAY_LABEL_MAP = {
  1: 'Not Very Important',
  2: 'A Little Important',
  3: 'Somewhat Important',
  4: 'Pretty Important',
  5: 'Very Important',
};

// How much effort slider constants
const DEFAULT_EFFORT = 1;

const MARKS_EFFORT = [
  {
    value: 1,
    label: '1-15 mins',
  },
  {
    value: 2,
    label: '16-60 mins',
  },
  {
    value: 3,
    label: '1-2 hours',
  },
  {
    value: 4,
    label: '2-5 hours',
  },
  {
    value: 5,
    label: '1+ days',
  },
];

const MARKS_EFFORT_VALUE_TO_DISPLAY_LABEL_MAP = {
  1: '15 minutes or less',
  2: 'Less than an hour',
  3: 'An hour or two',
  4: 'Up to five hours',
  5: 'More than a day',
};

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
  removeRecurringConfig,
}) => {
  // Visiblity Flags
  const [recurringOptionsVisible, setRecurringOptionsVisible] = useState(!!recurringConfig);
  const [recurringPopupVisible, setRecurringPopupVisible] = useState(false);
  const [blockersVisible, setBlockersVisible] = useState(dependencies.length > 0);

  // Recurring Config set up
  const selectedRecurringOption = getRecurringPresetFromConfig(recurringConfig);

  const debouncedSetImpact = debounce(setImpact, 100);
  const debouncedSetEffort = debounce(setEffort, 100);

  return (
    <FormContainer>
      <FieldContainer>
        <TransparentInputField
          required
          textarea
          placeholder="What do you need to do?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </FieldContainer>

      {/* @TODO: Figure out where this should go in the new design. */}
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

      <FieldContainer>
        <FieldTitle>How important is this task?</FieldTitle>

        <FieldAlertSubtitle>
          {MARKS_IMPORTANT_VALUE_TO_DISPLAY_LABEL_MAP[impact] || MARKS_IMPORTANT_VALUE_TO_DISPLAY_LABEL_MAP[DEFAULT_IMPACT]}
        </FieldAlertSubtitle>

        <SliderContainer>
          {/* <SliderHandContainer>
            <LeftHandIcon size="fill" />
          </SliderHandContainer> */}
          <Slider
            min={1}
            max={5}
            marks={MARKS_IMPORTANT}
            defaultValue={impact || DEFAULT_IMPACT}
            ThumbComponent={SliderThumb}
            onChange={(event, value) => debouncedSetImpact(value)}
          />
        </SliderContainer>
      </FieldContainer>

      <FieldContainer>
        <FieldTitle>How much time will this task require?</FieldTitle>

        <FieldAlertSubtitle>
          {MARKS_EFFORT_VALUE_TO_DISPLAY_LABEL_MAP[effort] || MARKS_EFFORT_VALUE_TO_DISPLAY_LABEL_MAP[DEFAULT_EFFORT]}
        </FieldAlertSubtitle>

        <SliderContainer>
          {/* <SliderHandContainer>
            <LeftHandIcon size="fill" />
          </SliderHandContainer> */}
          <Slider
            min={1}
            max={5}
            marks={MARKS_EFFORT}
            defaultValue={effort || DEFAULT_EFFORT}
            ThumbComponent={SliderThumb}
            onChange={(event, value) => debouncedSetEffort(value)}
          />
        </SliderContainer>
      </FieldContainer>

      <FieldContainer>
        <CheckboxLabel>
          <FlexContainer>
            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                value="1"
                checked={due != null && due !== ''}
                onChange={event => setDue(event.target.checked ? getInitialDueDate() : null)}
              />
              <Checkbox
                checked={due != null && due !== ''}
              />
            </CheckboxContainer>

            <CheckboxFieldTitle>Is there a due date?</CheckboxFieldTitle>
          </FlexContainer>
        </CheckboxLabel>

        {due != null && due !== '' &&
          <DateTimeField
            value={due}
            onChange={(event, newDateTime) => setDue(newDateTime)}
          />
        }

        {/* <ToggleableFieldWrapper
          defaultChecked={due != null && due !== ''}
          onChange={(event, checked) => setDue(checked ? getInitialDueDate() : null)}
        >
          <DateTimeField
            value={due}
            onChange={(event, newDateTime) => setDue(newDateTime)}
          />
        </ToggleableFieldWrapper> */}
      </FieldContainer>

      <FieldContainer>
        <CheckboxLabel>
          <FlexContainer>
            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                value="1"
                checked={scheduledStart != null && scheduledStart !== ''}
                onChange={event => setScheduledStart(event.target.checked ? getInitialDueDate() : null)}
              />
              <Checkbox
                checked={scheduledStart != null && scheduledStart !== ''}
              />
            </CheckboxContainer>

            <CheckboxFieldTitle>Is there a scheduled start date?</CheckboxFieldTitle>
          </FlexContainer>
        </CheckboxLabel>

        {scheduledStart != null && scheduledStart !== '' &&
          <DateTimeField
            value={scheduledStart}
            onChange={(event, newDateTime) => setScheduledStart(newDateTime)}
          />
        }

        {/* <ToggleableFieldWrapper
          label="Scheduled Start Date"
          helpText="Do you want to delay starting this task?"
          defaultChecked={scheduledStart != null && scheduledStart !== ''}
          onChange={(event, checked) => setScheduledStart(checked ? getInitialDueDate() : null)}
        >
          <DateTimeField
            value={scheduledStart}
            onChange={(event, newDateTime) => setScheduledStart(newDateTime)}
          />
        </ToggleableFieldWrapper> */}
      </FieldContainer>

      <FieldContainer>
        <CheckboxLabel>
          <FlexContainer>
            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                value="1"
                checked={recurringOptionsVisible}
                onChange={event => {
                  if (!event.target.checked && recurringConfig) {
                    removeRecurringConfig();
                  }
                  setRecurringOptionsVisible(event.target.checked);
                }}
              />
              <Checkbox
                checked={recurringOptionsVisible}
              />
            </CheckboxContainer>

            <CheckboxFieldTitle>[Beta] Does this task recur?</CheckboxFieldTitle>
          </FlexContainer>
        </CheckboxLabel>

        {recurringOptionsVisible &&
          <TopPaddedContainer>
            <Dropdown
              value={selectedRecurringOption}
              onChange={(event, value) => {
                const recurringDropdownActions = {
                  [NO_RECURRENCE_OPTION]: () => removeRecurringConfig(),
                  [EVERY_MONDAY_OPTION]: () => setRecurringConfig(RECURRING_CONFIG_EVERY_MONDAY),
                  [WEEKDAYS_OPTION]: () => setRecurringConfig(RECURRING_CONFIG_EVERY_WEEKDAY),
                  [CUSTOM_OPTION]: () => { },
                  [OPEN_RECURRENCE_MODAL_OPTION]: () => setRecurringPopupVisible(true),
                };
                (recurringDropdownActions[value] || (() => { }))();
              }}
            >
              <Dropdown.Option value={NO_RECURRENCE_OPTION}>
                {selectedRecurringOption === NO_RECURRENCE_OPTION ? '' : 'Not recurring'}
              </Dropdown.Option>
              <Dropdown.Option value={EVERY_MONDAY_OPTION}>Every Monday</Dropdown.Option>
              <Dropdown.Option value={WEEKDAYS_OPTION}>
                Every weekday (Monday to Friday)
            </Dropdown.Option>
              {recurringConfig && selectedRecurringOption === CUSTOM_OPTION && (
                <Dropdown.Option value={CUSTOM_OPTION}>
                  {getRecurringOptionLabel(recurringConfig)}
                </Dropdown.Option>
              )}
              <Dropdown.Option value={OPEN_RECURRENCE_MODAL_OPTION}>Custom...</Dropdown.Option>
            </Dropdown>
          </TopPaddedContainer>
        }


        {/* <ToggleableFieldWrapper
          label="Recurrence (early beta, unstable)"
          helpText="Do you need to do this multiple times?"
          defaultChecked={selectedRecurringOption !== ''}
          onChange={(event, checked) => {
            if (!checked && recurringConfig) {
              removeRecurringConfig();
            }
          }}
        >
          
        </ToggleableFieldWrapper> */}
      </FieldContainer>

      <FieldContainer>
        <CheckboxLabel>
          <FlexContainer>
            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                value="1"
                checked={blockersVisible}
                onChange={event => {
                  if (!event.target.checked) {
                    dependencies.forEach(({ id }) => removeTaskDependency(id));
                  }
                  setBlockersVisible(event.target.checked);
                }}
              />
              <Checkbox
                checked={blockersVisible}
              />
            </CheckboxContainer>

            <CheckboxFieldTitle>Are there any blockers?</CheckboxFieldTitle>
          </FlexContainer>
        </CheckboxLabel>

        {blockersVisible &&
          <BlockersSelector
            taskId={id}
            dependencies={dependencies}
            updateTaskDependency={updateTaskDependency}
            removeTaskDependency={removeTaskDependency}
            createTaskDependency={createTaskDependency}
          />
        }
      </FieldContainer>

      <FieldContainer>
        <FieldTitle>Notes</FieldTitle>

        <TopPaddedContainer>
          <InputField
            textarea
            placeholder="Enter notes here"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </TopPaddedContainer>
      </FieldContainer>

      <RecurringPopup
        open={recurringPopupVisible}
        onClose={() => setRecurringPopupVisible(false)}
        onDone={(value) => setRecurringConfig(value)}
        initialAmount={recurringConfig ? recurringConfig.amount : undefined}
        initialUnit={recurringConfig ? recurringConfig.unit : undefined}
        initialActiveWeekdays={recurringConfig ? recurringConfig.activeWeekdays : undefined}
      />
    </FormContainer>
  );
};

export default TaskForm;
