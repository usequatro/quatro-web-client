import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';
import addHours from 'date-fns/addHours';
import addWeeks from 'date-fns/addWeeks';
import startOfWeek from 'date-fns/startOfWeek';
import startOfTomorrow from 'date-fns/startOfTomorrow';

import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import EventRoundedIcon from '@material-ui/icons/EventRounded';
import NotesIcon from '@material-ui/icons/Notes';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import CloseIcon from '@material-ui/icons/Close';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';

import {
  selectNewTaskDialogOpen,
  selectEditTaskDialogId,
  createTask,
} from '../../../modules/dashboard';
import { updateTask, deleteTask } from '../../../modules/tasks';
import {
  selectTitle,
  selectDescription,
  selectImpact,
  selectEffort,
  selectScheduledStart,
  selectDue,
  selectBlockedBy,
  selectBlockedByTaskIds,
  selectRecurringConfig,
  setTitle,
  setDescription,
  setImpact,
  setEffort,
  setScheduledStart,
  setDue,
  addTaskBlocker,
  addFreeTextBlocker,
  removeBlockerByIndex,
  setRecurringConfig,
  setTaskInForm,
} from '../../../modules/taskForm';
import {
  createRecurringConfig,
  updateRecurringConfig,
  deleteRecurringConfig,
  selectRecurringConfigIdByMostRecentTaskId,
} from '../../../modules/recurringConfigs';
import LabeledIconButton from '../../ui/LabeledIconButton';
import Confirm from '../../ui/Confirm';
import DateTimeDialog from '../../ui/DateTimeDialog';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import BlockerSelectionDialog from '../tasks/BlockerSelectionDialog';
import RecurringConfigDialog from '../tasks/RecurringConfigDialog';
import { useNotification } from '../../Notification';
import * as blockerTypes from '../../../constants/blockerTypes';
import TaskTitle from '../tasks/TaskTitle';
import TaskSliderField from './TaskSliderField';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';
import formatDateTime from '../../../utils/formatDateTime';

const useStyles = makeStyles((theme) => ({
  dialogTitle: {
    position: 'relative',
    display: 'flex',
  },
  dialogTitleTypography: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
  },
  dialogActionBar: {
    display: 'flex',
    backgroundColor: theme.palette.background.secondary,
  },
  dialogContent: {
    padding: 0,
    [theme.breakpoints.up('sm')]: {
      width: '500px',
      maxWidth: '100%',
      height: '30rem',
      maxHeight: '70vh',
    },
  },
  titleTextField: {
    flexGrow: 1,
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  submitLoader: {
    color: theme.palette.common.white,
  },
  blockersList: {
    flexGrow: 1,
  },
  blockersIconButton: {
    padding: '6px', // to match the list item next to it
    paddingRight: '8px',
    marginTop: '3px',
  },
}));

const impactLabels = {
  0: 'Not very important',
  1: 'A little important',
  2: 'Somewhat important',
  3: 'Pretty important',
  4: 'Very important',
};

const impactSliderMarks = [
  { value: 0, label: 'Not very' },
  { value: 1, label: 'A little' },
  { value: 2, label: 'Somewhat' },
  { value: 3, label: 'Pretty' },
  { value: 4, label: 'Very' },
];

const effortLabels = {
  0: '15 minutes or less',
  1: '30 minutes',
  2: 'An hour',
  3: 'Two to five hours',
  4: 'More than a day',
};

const effortSliderMarks = [
  { value: 0, label: '1-15 mins' },
  { value: 1, label: '30 mins' },
  { value: 2, label: '1 hour' },
  { value: 3, label: '2-5 hours' },
  { value: 4, label: '1+ days' },
];

const initialScheduledDate = addHours(startOfTomorrow(), 9);
const initialDueDate = addHours(addWeeks(startOfWeek(new Date()), 1), 9);

const getBlockerTitle = cond([
  [
    (blockerDescriptor) => blockerDescriptor.type === blockerTypes.TASK,
    (blockerDescriptor) => <TaskTitle id={blockerDescriptor.config.taskId} />,
  ],
  [
    (blockerDescriptor) => blockerDescriptor.type === blockerTypes.FREE_TEXT,
    (blockerDescriptor) => `"${blockerDescriptor.config.value}"`,
  ],
  [() => true, () => 'Error'],
]);

const RepeatButtonDisabledTooltip = ({ mounted, children }) =>
  mounted ? (
    <Tooltip title="Add a Start Date to enable" enterDelay={0}>
      <span>{children}</span>
    </Tooltip>
  ) : (
    <>{children}</>
  );
RepeatButtonDisabledTooltip.propTypes = {
  mounted: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

const runDelayed = (fn, timeout) => setTimeout(fn, timeout);

const TaskDialogForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const { notifyError, notifyInfo } = useNotification();

  const newTaskDialogOpen = useSelector(selectNewTaskDialogOpen);

  // This will be defined if we're editing a task
  const editTaskDialogId = useSelector(selectEditTaskDialogId);
  // This will be defined if the task we're editing has a recurring config
  const editRecurringConfigId = useSelector((state) =>
    selectRecurringConfigIdByMostRecentTaskId(state, editTaskDialogId),
  );

  const title = useSelector(selectTitle);
  const description = useSelector(selectDescription);
  const impact = useSelector(selectImpact);
  const effort = useSelector(selectEffort);
  const scheduledStartTimestamp = useSelector(selectScheduledStart);
  const dueTimestamp = useSelector(selectDue);
  const blockedBy = useSelector(selectBlockedBy);
  const blockedByTaskIds = useSelector(selectBlockedByTaskIds);
  const recurringConfig = useSelector(selectRecurringConfig);

  const [showDescription, setShowDescription] = useState(Boolean(description));
  const [showDueDialog, setShowDueDialog] = useState(false);
  const [showScheduledStartDialog, setShowScheduledStartDialog] = useState(false);
  const [showBlockersDialog, setShowBlockersDialog] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // On opening edit task modal, load task data
  useEffect(() => {
    if (editTaskDialogId) {
      dispatch(setTaskInForm(editTaskDialogId));
    }
  }, [editTaskDialogId, dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = [title === '' && 'title'].filter(Boolean);
    setValidationErrors(errors);
    if (errors.length) {
      return;
    }

    setSubmitting(true);

    const taskPromise = editTaskDialogId
      ? // updating a task isn't async, so let's fake it 😇
        Promise.resolve().then(() => {
          dispatch(
            updateTask(editTaskDialogId, {
              title,
              impact,
              effort,
              description,
              due: dueTimestamp,
              scheduledStart: scheduledStartTimestamp,
              blockedBy,
              // Make sure to clear recurringConfigId if we don't have any repeat info set
              ...(!recurringConfig ? { recurringConfigId: null } : {}),
            }),
          );
          return editTaskDialogId;
        })
      : dispatch(
          createTask(title, impact, effort, {
            description: showDescription ? description : '',
            due: dueTimestamp,
            scheduledStart: scheduledStartTimestamp,
            blockedBy,
          }),
        );

    taskPromise
      // Recurring config handling
      .then(async (taskId) => {
        // Create, update or delete
        if (!editRecurringConfigId && recurringConfig) {
          const newRcId = await dispatch(
            createRecurringConfig({ ...recurringConfig, mostRecentTaskId: taskId }),
          );
          dispatch(updateTask(taskId, { recurringConfigId: newRcId }));
        } else if (editRecurringConfigId && recurringConfig) {
          dispatch(
            updateRecurringConfig(editRecurringConfigId, {
              ...recurringConfig,
              mostRecentTaskId: taskId,
            }),
          );
        } else if (editRecurringConfigId && !recurringConfig) {
          dispatch(deleteRecurringConfig(editRecurringConfigId));
        }
      })
      .then(() => {
        onClose();
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error); // eslint-disable-line no-console
        notifyError('Error saving task');
      });
  };

  const handleRepeatConfigChange = (config) => {
    dispatch(setRecurringConfig(config));
    setShowRecurringDialog(false);
  };

  const modalTitle = newTaskDialogOpen ? 'New Task' : 'Edit Task';
  const ctaText = newTaskDialogOpen ? 'Create' : 'Save';

  const scrollToBottom = useCallback(() => {
    const container = document.getElementById('task-dialog-content');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
  }, []);

  return (
    <Box
      onSubmit={handleSubmit}
      component="form"
      display="flex"
      height="100%"
      flexDirection="column"
    >
      <DialogTitle
        disableTypography
        className={classes.dialogTitle}
        color="transparent"
        elevation={0}
      >
        <Typography variant="h6" component="h2" className={classes.dialogTitleTypography}>
          {modalTitle}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.dialogContent} id="task-dialog-content">
        <Box pt={0} pb={2} px={3} display="flex" alignItems="flex-end">
          <TextField
            label="What do you need to do?"
            className={classes.titleTextField}
            autoFocus
            value={title}
            onChange={(event) => {
              dispatch(setTitle(event.target.value));
              if (validationErrors.includes('title')) {
                setValidationErrors(validationErrors.filter((e) => e !== 'title'));
              }
            }}
            error={validationErrors.includes('title')}
          />

          <Tooltip title={showDescription ? 'Remove notes' : 'Add notes'}>
            <IconButton
              size="small"
              edge="end"
              aria-label="Toggle notes"
              style={{ opacity: showDescription ? 0.5 : 1 }}
              onClick={() => setShowDescription(!showDescription)}
            >
              <NotesIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {showDescription && (
          <Box px={3} pb={4} pt={0}>
            <TextField
              placeholder="Notes"
              aria-label="Notes"
              fullWidth
              multiline
              rows={2}
              value={description}
              onChange={(event) => dispatch(setDescription(event.target.value))}
            />
          </Box>
        )}

        <Box px={3} pt={2} pb={4}>
          <TaskSliderField
            id="impact-slider"
            label="How important is this task?"
            value={impact}
            getValueText={(i) => impactLabels[i] || '-'}
            onChange={(value) => dispatch(setImpact(value))}
            marks={impactSliderMarks}
          />
        </Box>

        <Box px={3} pt={2} pb={4}>
          <TaskSliderField
            id="effort-slider"
            label="How much time will this task require?"
            value={effort}
            getValueText={(e) => effortLabels[e] || '-'}
            onChange={(value) => dispatch(setEffort(value))}
            marks={effortSliderMarks}
          />
        </Box>

        {(dueTimestamp || scheduledStartTimestamp || recurringConfig) && (
          <Box px={3} pt={0} pb={0} display="flex" flexDirection="column" alignItems="flexStart">
            {scheduledStartTimestamp && (
              <Button
                onClick={() => setShowScheduledStartDialog(true)}
                startIcon={<EventRoundedIcon />}
                className={classes.dateButton}
              >
                {'Start Date: '}
                {formatDateTime(scheduledStartTimestamp)}
              </Button>
            )}
            {dueTimestamp && (
              <Button
                onClick={() => setShowDueDialog(true)}
                startIcon={<AccessAlarmRoundedIcon />}
                className={classes.dateButton}
              >
                {'Due Date: '}
                {formatDateTime(dueTimestamp)}
              </Button>
            )}
            {recurringConfig && (
              <Button
                onClick={() => setShowRecurringDialog(true)}
                startIcon={<ReplayRoundedIcon />}
                className={classes.dateButton}
              >
                {'Repeat: '}
                {getUserFacingRecurringText(recurringConfig)}
              </Button>
            )}
          </Box>
        )}

        {blockedBy.length > 0 && (
          <Box px={3} pt={0} pb={2} display="flex" flexDirection="row" alignItems="flex-start">
            <Tooltip title="Add Blocker">
              <IconButton
                aria-label="blockers"
                onClick={() => setShowBlockersDialog(!showBlockersDialog)}
                className={classes.blockersIconButton}
              >
                <BlockRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <List disablePadding className={classes.blockersList}>
              {blockedBy.map((blockerDescriptor, index) => (
                <ListItem
                  key={index /* eslint-disable-line react/no-array-index-key */}
                  disableGutters
                  dense
                >
                  <ListItemText primary={getBlockerTitle(blockerDescriptor)} />

                  <ListItemSecondaryAction>
                    <Tooltip title="Delete Blocker">
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        size="small"
                        onClick={() => dispatch(removeBlockerByIndex(index))}
                      >
                        <ClearRoundedIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions className={classes.dialogActionBar} disableSpacing>
        <Box flexGrow={1}>
          <LabeledIconButton
            label="Start Date"
            icon={<EventRoundedIcon />}
            onClick={() => setShowScheduledStartDialog(!showScheduledStartDialog)}
          />
          <RepeatButtonDisabledTooltip mounted={!scheduledStartTimestamp}>
            <LabeledIconButton
              label="Repeat"
              disabled={!scheduledStartTimestamp}
              icon={<ReplayRoundedIcon />}
              onClick={() => setShowRecurringDialog(!showRecurringDialog)}
            />
          </RepeatButtonDisabledTooltip>
          <LabeledIconButton
            label="Due Date"
            icon={<AccessAlarmRoundedIcon />}
            onClick={() => setShowDueDialog(!showDueDialog)}
          />
          <LabeledIconButton
            label="Blockers"
            icon={<BlockRoundedIcon />}
            onClick={() => setShowBlockersDialog(!showBlockersDialog)}
          />
        </Box>

        {editTaskDialogId && (
          <Confirm
            onConfirm={() => {
              onClose();
              dispatch(deleteTask(editTaskDialogId));
              notifyInfo('Task deleted');
            }}
            renderDialog={(open, onConfirm, onConfirmationClose) => (
              <ConfirmationDialog
                open={open}
                onClose={onConfirmationClose}
                onConfirm={onConfirm}
                id="confirm-delete-task"
                title="Delete task"
                body={[
                  'Are you sure you want to delete this task?',
                  recurringConfig && 'The task will stop repeating when deleted',
                ].filter(Boolean)}
                buttonText="Delete"
              />
            )}
            renderContent={(onClick) => (
              <LabeledIconButton
                label="Delete"
                icon={<DeleteOutlineRoundedIcon />}
                onClick={onClick}
              />
            )}
          />
        )}

        {submitting ? (
          <CircularProgress thickness={4} size="2rem" className={classes.submitLoader} />
        ) : (
          <LabeledIconButton type="submit" label={ctaText} icon={<SendRoundedIcon />} />
        )}
      </DialogActions>

      <DateTimeDialog
        label="Start date"
        id="scheduled-start-dialog"
        open={showScheduledStartDialog}
        onClose={() => setShowScheduledStartDialog(false)}
        value={scheduledStartTimestamp}
        onChangeCommitted={(value) => {
          let scheduled = value;
          if (scheduled instanceof Date) {
            scheduled = scheduled.getTime()
          }
          dispatch(setScheduledStart(scheduled));
          
          // If we remove the scheduled start and there was repeat, also clear it
          if (!value && recurringConfig) {
            dispatch(setRecurringConfig(null));
          }
        }}
        initialDate={initialScheduledDate}
      />

      <DateTimeDialog
        label="Due date"
        id="due-dialog"
        open={showDueDialog}
        onClose={() => setShowDueDialog(false)}
        value={dueTimestamp}
        onChangeCommitted={(value) => dispatch(setDue(value))}
        initialDate={initialDueDate}
      />

      <BlockerSelectionDialog
        open={showBlockersDialog}
        onClose={() => setShowBlockersDialog(false)}
        onSelect={(id) => {
          dispatch(addTaskBlocker(id));
          runDelayed(scrollToBottom, 150);
        }}
        onFreeTextEntered={(value) => {
          dispatch(addFreeTextBlocker(value));
          runDelayed(scrollToBottom, 150);
        }}
        disabledTasks={blockedByTaskIds}
        hiddenTasks={editTaskDialogId ? [editTaskDialogId] : []}
      />

      <RecurringConfigDialog
        open={showRecurringDialog}
        onClose={() => setShowRecurringDialog(false)}
        onRepeatConfigChange={(config) => handleRepeatConfigChange(config)}
        referenceDate={scheduledStartTimestamp}
      />
    </Box>
  );
};

TaskDialogForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default TaskDialogForm;
