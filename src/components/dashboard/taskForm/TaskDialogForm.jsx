import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import cond from 'lodash/cond';
import addHours from 'date-fns/addHours';
import addWeeks from 'date-fns/addWeeks';
import startOfWeek from 'date-fns/startOfWeek';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import isPast from 'date-fns/isPast';

import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import EventRoundedIcon from '@material-ui/icons/EventRounded';
import NotesIcon from '@material-ui/icons/Notes';
import BlockRoundedIcon from '@material-ui/icons/BlockRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import {
  selectNewTaskDialogOpen,
  selectEditTaskDialogId,
  createTask,
  setSnackbarData,
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
import { TextFieldWithTypography } from '../../ui/InputWithTypography';
import BlockerSelectionDialog from '../tasks/BlockerSelectionDialog';
import RecurringConfigDialog from '../tasks/RecurringConfigDialog';
import { useNotification } from '../../Notification';
import * as blockerTypes from '../../../constants/blockerTypes';
import TaskTitle from '../tasks/TaskTitle';
import SliderField from '../../ui/SliderField';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';
import formatDateTime from '../../../utils/formatDateTime';
import {
  impactLabels,
  impactSliderMarks,
  effortLabels,
  effortSliderMarks,
} from '../../../constants/taskFormConstants';

const useStyles = makeStyles((theme) => ({
  dialogContent: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: '70vh',
  },
  titleTextField: {
    flexGrow: 1,
  },
  dateButtonActive: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  dateButtonInactive: {
    justifyContent: 'flex-start',
    textAlign: 'left',
    opacity: 0.5,
  },
  submitLoader: {
    color: theme.palette.common.white,
  },
  pastDueIconButton: {
    color: theme.palette.error.main,
  },
  blockersIconButton: {
    padding: '6px', // to match the list item next to it
    paddingRight: '8px',
    marginTop: '3px',
  },
  blockerTitle: {
    padding: `0 ${theme.spacing(2)}px 0 0`,
  },
  blockerListItemRoot: {
    padding: 0,
  },
}));

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
    <Tooltip title="Add a Start Date to enable" enterDelay={0} placement="bottom-start">
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

  const { notifyError } = useNotification();

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

  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const menuButtonRef = useRef();

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
      <Box py={3} px={3} className={classes.dialogContent} id="task-dialog-content">
        <Box pb={2} display="flex" alignItems="flex-end">
          <TextFieldWithTypography
            typography="h6"
            aria-label="What do you need to do?"
            placeholder="What do you need to do?"
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
              aria-label="Toggle notes"
              style={{ opacity: showDescription ? 0.5 : 1 }}
              onClick={() => setShowDescription(!showDescription)}
            >
              <NotesIcon />
            </IconButton>
          </Tooltip>

          {editTaskDialogId && (
            <>
              <IconButton
                size="small"
                edge="end"
                aria-label="Toggle more options menu"
                onClick={() => setOptionsMenuOpen(true)}
                ref={menuButtonRef}
              >
                <MoreVertIcon />
              </IconButton>
              <Confirm
                onConfirm={() => {
                  onClose();
                  dispatch(deleteTask(editTaskDialogId));
                  dispatch(
                    setSnackbarData({
                      open: true,
                      message: 'Task deleted',
                      id: editTaskDialogId,
                    }),
                  );
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
                renderContent={(onDeleteClick) => (
                  <Menu
                    open={optionsMenuOpen}
                    onClose={() => setOptionsMenuOpen(false)}
                    anchorEl={menuButtonRef.current}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={onDeleteClick}>Delete</MenuItem>
                  </Menu>
                )}
              />
            </>
          )}
        </Box>

        {showDescription && (
          <Box pb={4}>
            <TextFieldWithTypography
              typography="body2"
              placeholder="Notes"
              aria-label="Notes"
              fullWidth
              multiline
              rowsMax={4}
              value={description}
              onChange={(event) => dispatch(setDescription(event.target.value))}
            />
          </Box>
        )}

        <Box pt={2} pb={4}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <SliderField
                id="impact-slider"
                label="What impact will this task have?"
                value={impact}
                getValueText={(i) => impactLabels[i] || '-'}
                onChange={(value) => dispatch(setImpact(value))}
                marks={impactSliderMarks}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SliderField
                id="effort-slider"
                label="How much time will this task require?"
                value={effort}
                getValueText={(e) => effortLabels[e] || '-'}
                onChange={(value) => dispatch(setEffort(value))}
                marks={effortSliderMarks}
              />
            </Grid>
          </Grid>
        </Box>

        <Box pt={0} pb={0} display="flex" flexDirection="column" alignItems="flex-start">
          <Box display="flex">
            <Button
              onClick={() => setShowScheduledStartDialog(true)}
              startIcon={<EventRoundedIcon />}
              className={
                scheduledStartTimestamp ? classes.dateButtonActive : classes.dateButtonInactive
              }
            >
              {scheduledStartTimestamp ? formatDateTime(scheduledStartTimestamp) : 'Set start date'}
            </Button>
            {scheduledStartTimestamp && (
              <Tooltip title="Clear scheduled start">
                <IconButton
                  edge="end"
                  aria-label="clear scheduled start"
                  size="small"
                  onClick={() => dispatch(setScheduledStart(null))}
                >
                  <ClearRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <RepeatButtonDisabledTooltip mounted={!scheduledStartTimestamp}>
            <Box display="flex">
              <Button
                onClick={() => setShowRecurringDialog(true)}
                startIcon={<ReplayRoundedIcon />}
                className={recurringConfig ? classes.dateButtonActive : classes.dateButtonInactive}
                disabled={!scheduledStartTimestamp}
              >
                {recurringConfig ? getUserFacingRecurringText(recurringConfig) : 'Set repeat'}
              </Button>
              {recurringConfig && (
                <Tooltip title="Clear repeat">
                  <IconButton
                    edge="end"
                    aria-label="clear repeat"
                    size="small"
                    onClick={() => dispatch(setRecurringConfig(null))}
                  >
                    <ClearRoundedIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </RepeatButtonDisabledTooltip>

          <Box display="flex">
            <Button
              onClick={() => setShowDueDialog(true)}
              startIcon={
                <AccessAlarmRoundedIcon
                  className={isPast(dueTimestamp) ? classes.pastDueIconButton : undefined}
                />
              }
              className={dueTimestamp ? classes.dateButtonActive : classes.dateButtonInactive}
            >
              {dueTimestamp ? formatDateTime(dueTimestamp) : 'Set due date'}
            </Button>
            {dueTimestamp && (
              <Tooltip title="Clear due date">
                <IconButton
                  edge="end"
                  aria-label="clear due date"
                  size="small"
                  onClick={() => dispatch(setDue(null))}
                >
                  <ClearRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {(blockedBy || []).length > 0 && (
            <List disablePadding className="MuiButton-text">
              {blockedBy.map((blockerDescriptor, index) => (
                <ListItem
                  key={index /* eslint-disable-line react/no-array-index-key */}
                  classes={{ root: classes.blockerListItemRoot }}
                  disableGutters
                  dense
                >
                  <IconButton
                    edge="start"
                    aria-label="blockers"
                    onClick={() => setShowBlockersDialog(!showBlockersDialog)}
                    className={classes.blockersIconButton}
                  >
                    <BlockRoundedIcon fontSize="small" />
                  </IconButton>
                  <Typography className={classes.blockerTitle} variant="body2">
                    {getBlockerTitle(blockerDescriptor)}
                  </Typography>

                  <Tooltip title="Remove blocker">
                    <IconButton
                      edge="end"
                      aria-label="remove blocker"
                      size="small"
                      onClick={() => dispatch(removeBlockerByIndex(index))}
                    >
                      <ClearRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          )}

          <Button
            onClick={() => setShowBlockersDialog(!showBlockersDialog)}
            startIcon={<BlockRoundedIcon />}
            className={classes.dateButtonInactive}
          >
            Add blocker
          </Button>
        </Box>

        <Box display="flex" justifyContent="flex-end">
          {submitting ? (
            <CircularProgress thickness={4} size="2rem" className={classes.submitLoader} />
          ) : (
            <LabeledIconButton
              color="inherit"
              type="submit"
              label={newTaskDialogOpen ? 'Create' : 'Save'}
              icon={<SendRoundedIcon />}
            />
          )}
        </Box>
      </Box>

      <DateTimeDialog
        label="Start date"
        id="scheduled-start-dialog"
        open={showScheduledStartDialog}
        onClose={() => setShowScheduledStartDialog(false)}
        value={scheduledStartTimestamp}
        onChangeCommitted={(value) => {
          const scheduled = value instanceof Date ? value.getTime() : value;
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
