import React, { useState } from 'react';
import styled from 'styled-components';
// import memoize from 'lodash/memoize';
import debounce from 'lodash/debounce';
import { Box } from 'rebass/styled-components';

import ReplayIcon from '@material-ui/icons/Replay';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import Calendar from 'react-calendar';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import 'react-calendar/dist/Calendar.css';
import IconButton from '@material-ui/core/IconButton';

import {
  RECURRING_CONFIG_EVERY_MONDAY,
  RECURRING_CONFIG_EVERY_WEEKDAY,
} from '../../../../util/recurrence';

import {
  MARKS_IMPORTANT,
  MARKS_IMPORTANT_VALUE_TO_DISPLAY_LABEL_MAP,
} from '../../../../constants/importantValues';

import {
  MARKS_EFFORT,
  MARKS_EFFORT_VALUE_TO_DISPLAY_LABEL_MAP,
} from '../../../../constants/effortValues';

import InputField from '../../../ui/InputField';
import TransparentInputField from '../../../ui/TransparentInputField';
import Paragraph from '../../../ui/Paragraph';
import ButtonInline from '../../../ui/ButtonInline';
import Slider, { SliderThumb } from '../../../ui/Slider';
import HeadingResponsive from '../../../ui/HeadingResponsive';
import colorSmoothTransitions from '../../../style-mixins/colorSmoothTransitions';
import { activeOpacity } from '../../../style-mixins/activeLighter';

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
  letter-spacing: ${({ theme }) => theme.letterSpacings.large};
  text-align: center;
  font-weight: bold;
`;

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
  .react-calendar__tile--active {
    background: 'white'
  }
`;

const useStyles = makeStyles((theme) => ({
  calendar: {
    width: '100%',
    maxWidth: 360,
    border: '0px',
    padding: '.3em',
    '& .react-calendar__tile--active': {
      background: '#414D67',
      display: 'inline-block',
      'border-radius': '10%',
      height: '3em',
    },
    '& .react-calendar__tile--active:enabled:hover': {
      background: '#414D67',
    },
    '& .react-calendar__tile--active:enabled:focus': {
      background: '#414D67',
    },
    '& .react-calendar__tile--now': {
      display: 'inline-block',
      'border-radius': '10%',
      height: '3em',
      background: '#EDF3F4',
    },
    '& .react-calendar__tile': {
      height: '3em',
    },
    '& .react-calendar__navigation__label': {
      'font-weight': 'bold',
    },
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 0,
    '&:hover': {
      outline: 'none',
    },
  },
  modalDiv: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'white',
    outline: 0,
    '&:hover': {
      outline: 'none',
    },
  },
  button: {
    width: '100%',
    maxWidth: 350,
    height: '90%',
    justifyContent: 'space-between',
    fontSize: '10px',
    backgroundColor: 'white',
  },
  iconButtonLabel: {
    fontSize: '15px',
  },
  timePicker: {
    width: '100%',
    maxWidth: 350,
    margin: 0,
  },
  repeatModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'white',
  },
  listHeaders: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
  paperPrimary: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
  },
  paperSecondaryLeft: {
    padding: theme.spacing(2),
    float: 'left',
    color: theme.palette.text.secondary,
    fontSize: '.8em',
    'text-transform': 'none',
  },
  paperSecondaryRight: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    float: 'right',
    fontSize: '.8em',
    'text-transform': 'none',
  },
  repeatText: {
    marginLeft: '10px',
  },
  repeatButton: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

// How Important Slider constants
const DEFAULT_IMPACT = 5;

// How much effort slider constants
const DEFAULT_EFFORT = 1;

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
  openStartDate,
  handleCloseStartDate,
  handleCancelStartDate,
  openDueDate,
  handleCloseDueDate,
  handleConfirmStartDate,
  handleConfirmDueDate,
  handleCancelDueDate,
}) => {
  // Visiblity Flags

  // If dateToUse is not null, use that date, otherwise
  // fallback to creating a new date object and adding
  // the daysToAdd value to it
  const dateHandler = (dateToUse, daysToAdd) => {
    if (dateToUse !== null) {
      return new Date(dateToUse);
    }
    const today = new Date();
    return new Date(
      today.getFullYear(), today.getMonth(), today.getDate() + daysToAdd, 9, 0, 0,
    );
  };

  const [recurringPopupVisible, setRecurringPopupVisible] = useState(false);
  const [blockersVisible, setBlockersVisible] = useState(dependencies.length > 0);
  const [selectedStartDate, setSelectedStartDate] = useState(dateHandler(scheduledStart, 1));
  const [selectedStartTime, setSelectedStartTime] = useState(dateHandler(scheduledStart, 1));
  const [selectedDueDate, setSelectedDueDate] = useState(dateHandler(due, 2));
  const [selectedDueTime, setSelectedDueTime] = useState(dateHandler(due, 2));
  const [openRepeat, setOpenRepeat] = useState(false);
  const [recurringLabel, setRecurringLabel] = useState('');

  const handleStartTimeChange = (time) => {
    setSelectedStartTime(time);
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleDoneStartDate = () => {
    const datetime = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate(),
      selectedStartTime.getHours(),
      selectedStartTime.getMinutes(),
      selectedStartTime.getSeconds(),
    );
    setScheduledStart(datetime.getTime());
    handleConfirmStartDate(datetime);
  };

  const handleDueTimeChange = (time) => {
    setSelectedDueTime(time);
  };

  const handleDueDateChange = (date) => {
    setSelectedDueDate(date);
  };

  const handleDoneDueDate = () => {
    const datetime = new Date(
      selectedDueDate.getFullYear(),
      selectedDueDate.getMonth(),
      selectedDueDate.getDate(),
      selectedDueTime.getHours(),
      selectedDueTime.getMinutes(),
      selectedDueTime.getSeconds(),
    );
    setDue(datetime.getTime());
    handleConfirmDueDate(datetime);
  };

  const handleOpenRepeat = () => {
    setOpenRepeat(true);
  };

  const handleCloseRepeat = () => {
    setOpenRepeat(false);
  };

  const handleSetRecurringInModal = (value, label) => {
    setRecurringConfig(value);
    setRecurringLabel(label);
    setOpenRepeat(false);
  };

  // Refs for input focus
  // const taskNameRef = useRef(null);
  // useEffect(() => {
  //   console.log(taskNameRef.current);
  //   taskNameRef.current.focus();
  // }, []);

  const debouncedSetImpact = debounce(setImpact, 100);
  const debouncedSetEffort = debounce(setEffort, 100);

  const classes = useStyles();

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
          .
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
                checked={blockersVisible}
                onChange={(event) => {
                  if (!event.target.checked) {
                    dependencies.forEach(({ depId }) => removeTaskDependency(depId));
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

        {blockersVisible
          && (
          <BlockersSelector
            taskId={id}
            dependencies={dependencies}
            updateTaskDependency={updateTaskDependency}
            removeTaskDependency={removeTaskDependency}
            createTaskDependency={createTaskDependency}
          />
          )}
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

      <Modal
        open={openStartDate}
        onClose={handleCloseStartDate}
        aria-labelledby="date-modal"
        className={classes.modal}
      >
        <div className={classes.modalDiv}>
          <Grid container justify="center" spacing={0} className={classes.headerGrid}>
            <Grid item xs={3}>
              <Button className={classes.paperSecondaryLeft} onClick={handleCancelStartDate}>Clear</Button>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} className={classes.paperPrimary}>Start Date</Paper>
            </Grid>
            <Grid item xs={3}>
              <Button className={classes.paperSecondaryRight} onClick={handleDoneStartDate}>Done</Button>
            </Grid>
          </Grid>
          <Divider />
          <Calendar
            className={classes.calendar}
            value={selectedStartDate}
            onChange={handleStartDateChange}
          />

          <List component="time-and-repeat" aria-label="">
            <ListItem button>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardTimePicker
                  margin="normal"
                  id="time-picker"
                  label="Time"
                  value={selectedStartTime}
                  onChange={handleStartTimeChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                  className={classes.timePicker}
                />
              </MuiPickersUtilsProvider>
            </ListItem>
            <ListItem button>
              <Button
                className={classes.button}
                startIcon={(
                  <IconButton edge="start" color="inherit" classes={{ root: classes.repeatButton, label: classes.iconButtonLabel }}>
                    <ReplayIcon />
                    <small className={classes.repeatText}>Repeat</small>
                  </IconButton>
                )}
                onClick={handleOpenRepeat}
              >
                {recurringLabel}
              </Button>
            </ListItem>
          </List>
          <Modal
            open={openRepeat}
            onClose={handleCloseRepeat}
            aria-labelledby="repeat-modal"
            className={classes.modal}
          >
            <div className={classes.repeatModal}>
              <Grid container justify="center" spacing={0} className={classes.headerGrid}>
                <Grid item xs={3}>
                  <Button className={classes.paperSecondaryLeft} onClick={() => handleSetRecurringInModal(null, '')}>Clear</Button>
                </Grid>
                <Grid item xs={6}>
                  <Paper elevation={0} className={classes.paperPrimary}>Repeat</Paper>
                </Grid>
                <Grid item xs={3}>
                  <Button className={classes.paperSecondaryRight} onClick={handleCloseRepeat}>Done</Button>
                </Grid>
              </Grid>
              <Divider />
              <br />
              <List component="nav" aria-label="">
                <ListItem button onClick={() => handleSetRecurringInModal(RECURRING_CONFIG_EVERY_MONDAY, 'Every Monday')}>
                  <ListItemText primary="Every Monday" />
                </ListItem>
                <ListItem button onClick={() => handleSetRecurringInModal(RECURRING_CONFIG_EVERY_WEEKDAY, 'Every weekday')}>
                  <ListItemText primary="Every weekday (Monday to Friday)" />
                </ListItem>
                <ListItem button onClick={() => setRecurringPopupVisible(true)}>
                  <ListItemText primary="Custom..." />
                </ListItem>
              </List>
            </div>
          </Modal>
        </div>
      </Modal>

      <Modal
        open={openDueDate}
        onClose={handleCloseDueDate}
        aria-labelledby="date-modal"
        className={classes.modal}
      >
        <div className={classes.modalDiv}>
          <Grid container justify="center" spacing={0} className={classes.headerGrid}>
            <Grid item xs={3}>
              <Button className={classes.paperSecondaryLeft} onClick={handleCancelDueDate}>Clear</Button>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} className={classes.paperPrimary}>Due Date</Paper>
            </Grid>
            <Grid item xs={3}>
              <Button className={classes.paperSecondaryRight} onClick={handleDoneDueDate}>Done</Button>
            </Grid>
          </Grid>
          <Divider />
          <Calendar
            className={classes.calendar}
            value={selectedDueDate}
            onChange={handleDueDateChange}
          />

          <List component="time-and-repeat" aria-label="">
            <ListItem button>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardTimePicker
                  margin="normal"
                  id="time-picker"
                  label="Time"
                  value={selectedDueTime}
                  onChange={handleDueTimeChange}
                  KeyboardButtonProps={{
                    'aria-label': 'change time',
                  }}
                  className={classes.timePicker}
                />
              </MuiPickersUtilsProvider>
            </ListItem>
          </List>
        </div>
      </Modal>

      <RecurringPopup
        open={recurringPopupVisible}
        onClose={() => setRecurringPopupVisible(false)}
        onDone={(value) => handleSetRecurringInModal(value, 'Custom')}
        initialAmount={recurringConfig ? recurringConfig.amount : undefined}
        initialUnit={recurringConfig ? recurringConfig.unit : undefined}
        initialActiveWeekdays={recurringConfig ? recurringConfig.activeWeekdays : undefined}
      />
    </FormContainer>
  );
};

export default TaskForm;
