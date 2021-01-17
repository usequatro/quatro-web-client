import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import cond from 'lodash/cond';
import addHours from 'date-fns/addHours';
import addWeeks from 'date-fns/addWeeks';
import startOfWeek from 'date-fns/startOfWeek';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import addMinutes from 'date-fns/addMinutes';
import differenceInMinutes from 'date-fns/differenceInMinutes';

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
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';

import { createTask } from '../../../modules/dashboard';
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
  selectCalendarBlockCalendarId,
  selectCalendarBlockStart,
  selectCalendarBlockEnd,
  setTitle,
  setDescription,
  setImpact,
  setEffort,
  setScheduledStart,
  setCalendarBlockCalendarId,
  setCalendarBlockStart,
  setCalendarBlockEnd,
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
import { selectGapiHasAllCalendarScopes } from '../../../modules/session';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';
import { selectCalendarCount } from '../../../modules/calendars';
import LabeledIconButton from '../../ui/LabeledIconButton';
import Confirm from '../../ui/Confirm';
import DateTimeDialog from '../../ui/DateTimeDialog';
import ScheduledStartDialog from './ScheduledStartDialog';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import BlockerSelectionDialog from '../tasks/BlockerSelectionDialog';
import RecurringConfigMenu from '../tasks/RecurringConfigMenu';
import RecurringCustomDialog from '../tasks/RecurringCustomDialog';
import { useNotification } from '../../Notification';
import * as blockerTypes from '../../../constants/blockerTypes';
import TaskTitle from '../tasks/TaskTitle';
import SliderField from '../../ui/SliderField';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';
import formatDateTime from '../../../utils/formatDateTime';
import {
  impactLabels,
  impactSliderMarks,
  effortLabels,
  effortSliderMarks,
} from '../../../constants/taskFormConstants';
import useIsTouchEnabledScreen from '../../hooks/useIsTouchEnabledScreen';
import { useMixpanel } from '../../tracking/MixpanelContext';
import { TASK_CREATED, TASK_UPDATED } from '../../../constants/mixpanelEvents';

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
    backgroundColor: theme.palette.background.default,
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
  settingButton: {
    justifyContent: 'flex-start',
    textAlign: 'left',
    fontWeight: 'normal',
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

const initialScheduledDateTimestamp = addHours(startOfTomorrow(), 9).getTime();
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
    <Tooltip title="Add a Start Date to enable" enterDelay={0} arrow>
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

const TaskDialogForm = ({ onClose, taskId }) => {
  const dispatch = useDispatch();
  const mixpanel = useMixpanel();
  const classes = useStyles();

  const { notifyError, notifyInfo } = useNotification();

  const newTaskDialogOpen = !taskId;

  // This will be defined if we're editing a task
  const editTaskDialogId = taskId;
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
  const calendarBlockCalendarId = useSelector(selectCalendarBlockCalendarId);
  const calendarBlockStart = useSelector(selectCalendarBlockStart);
  const calendarBlockEnd = useSelector(selectCalendarBlockEnd);

  const calendarCount = useSelector(selectCalendarCount);
  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);
  const userHasGrantedCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );

  const [showDescription, setShowDescription] = useState(Boolean(description));
  const [showDueDialog, setShowDueDialog] = useState(false);
  const [showScheduledStartDialog, setShowScheduledStartDialog] = useState(false);
  const [showBlockersDialog, setShowBlockersDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [recurringCustomDialogOpen, setRecurringCustomDialogOpen] = useState(false);

  const repeatActionButtonRef = useRef();
  const repeatSettingRef = useRef();
  const [recurringMenuAnchorEl, setRecurringMenuAnchorEl] = useState(undefined);

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

    const hasCalendarBlock = Boolean(calendarBlockStart && calendarBlockEnd);

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
              calendarBlockCalendarId: hasCalendarBlock ? calendarBlockCalendarId : null,
              calendarBlockStart: hasCalendarBlock ? calendarBlockStart : null,
              calendarBlockEnd: hasCalendarBlock ? calendarBlockEnd : null,
              // Make sure to clear recurringConfigId if we don't have any repeat info set
              ...(!recurringConfig ? { recurringConfigId: null } : {}),
            }),
          ).then(() => {
            mixpanel.track(TASK_UPDATED, {
              hasBlockers: blockedBy.length > 0,
              hasScheduledStart: Boolean(scheduledStartTimestamp),
              hasDueDate: Boolean(dueTimestamp),
              isRecurring: Boolean(recurringConfig),
              hasCalendarBlock,
            });
          });
          return editTaskDialogId;
        })
      : dispatch(
          createTask(
            title,
            impact,
            effort,
            {
              description: showDescription ? description : '',
              due: dueTimestamp,
              scheduledStart: scheduledStartTimestamp,
              blockedBy,
              calendarBlockCalendarId: hasCalendarBlock ? calendarBlockCalendarId : null,
              calendarBlockStart: hasCalendarBlock ? calendarBlockStart : null,
              calendarBlockEnd: hasCalendarBlock ? calendarBlockEnd : null,
            },
            ({ notificationButtonText, notificationButtonLink }) => {
              notifyInfo({
                message: 'Task created',
                buttons:
                  notificationButtonLink && notificationButtonText
                    ? [
                        {
                          component: Link,
                          to: notificationButtonLink,
                          children: notificationButtonText,
                        },
                      ]
                    : undefined,
              });
            },
          ),
        ).then(() => {
          mixpanel.track(TASK_CREATED, {
            hasBlockers: blockedBy.length > 0,
            hasScheduledStart: Boolean(scheduledStartTimestamp),
            hasDueDate: Boolean(dueTimestamp),
            isRecurring: Boolean(recurringConfig),
            hasCalendarBlock,
          });
        });

    taskPromise
      // Recurring config handling
      .then(async (tId) => {
        // Create, update or delete
        if (!editRecurringConfigId && recurringConfig) {
          const newRcId = await dispatch(
            createRecurringConfig({ ...recurringConfig, mostRecentTaskId: tId }),
          );
          dispatch(updateTask(tId, { recurringConfigId: newRcId }));
        } else if (editRecurringConfigId && recurringConfig) {
          dispatch(
            updateRecurringConfig(editRecurringConfigId, {
              ...recurringConfig,
              mostRecentTaskId: tId,
            }),
          );
        } else if (editRecurringConfigId && !recurringConfig) {
          dispatch(deleteRecurringConfig(editRecurringConfigId));
        }
        return tId;
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

  const isTouchEnabledScreen = useIsTouchEnabledScreen();

  return (
    <Box
      onSubmit={handleSubmit}
      component="form"
      display="flex"
      height="100%"
      flexDirection="column"
    >
      <DialogTitleWithClose
        onClose={onClose}
        title={modalTitle}
        TypographyProps={{ variant: 'h5', component: 'h2' }}
      />

      <DialogContent className={classes.dialogContent} id="task-dialog-content">
        <Box pt={1} pb={2} px={3} display="flex" alignItems="flex-end">
          <TextField
            label="What do you need to do?"
            className={classes.titleTextField}
            // Autofocus with real keyboard, not when screen keyboard because it's annoying
            autoFocus={!isTouchEnabledScreen}
            multiline
            rowsMax={3}
            value={title}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                handleSubmit(event);
              }
            }}
            onChange={(event) => {
              dispatch(setTitle(event.target.value));
              if (validationErrors.includes('title')) {
                setValidationErrors(validationErrors.filter((e) => e !== 'title'));
              }
            }}
            error={validationErrors.includes('title')}
          />

          <Tooltip title={showDescription ? 'Remove notes' : 'Add notes'} arrow enterDelay={1000}>
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
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  handleSubmit(event);
                }
              }}
              onChange={(event) => dispatch(setDescription(event.target.value))}
            />
          </Box>
        )}

        <Box px={3} pt={2} pb={4}>
          <SliderField
            id="impact-slider"
            label="What impact will this task have?"
            value={impact}
            getValueText={(i) => impactLabels[i] || '-'}
            onChange={(value) => dispatch(setImpact(value))}
            marks={impactSliderMarks}
          />
        </Box>

        <Box px={3} pt={2} pb={4}>
          <SliderField
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
                className={classes.settingButton}
              >
                {'Start Date: '}
                {formatDateTime(scheduledStartTimestamp)}

                {calendarBlockStart && calendarBlockEnd && (
                  <>
                    <br />
                    {`${differenceInMinutes(
                      calendarBlockEnd,
                      calendarBlockStart,
                    )} minutes blocked in calendar`}
                  </>
                )}
              </Button>
            )}
            {dueTimestamp && (
              <Button
                onClick={() => setShowDueDialog(true)}
                startIcon={<AccessAlarmRoundedIcon />}
                className={classes.settingButton}
              >
                {'Due Date: '}
                {formatDateTime(dueTimestamp)}
              </Button>
            )}
            {recurringConfig && (
              <Button
                ref={repeatSettingRef}
                onClick={() => setRecurringMenuAnchorEl(repeatSettingRef.current)}
                startIcon={<ReplayRoundedIcon />}
                className={classes.settingButton}
              >
                {'Repeat: '}
                {getUserFacingRecurringText(recurringConfig, scheduledStartTimestamp)}
              </Button>
            )}
          </Box>
        )}

        {blockedBy.length > 0 && (
          <Box px={3} pt={0} pb={2} display="flex" flexDirection="row" alignItems="flex-start">
            <Tooltip title="Add Blocker" arrow>
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
                    <Tooltip title="Delete Blocker" arrow>
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
            color="inherit"
            icon={<EventRoundedIcon />}
            onClick={() => setShowScheduledStartDialog(!showScheduledStartDialog)}
          />
          <RepeatButtonDisabledTooltip mounted={!scheduledStartTimestamp}>
            <LabeledIconButton
              label="Repeat"
              color="inherit"
              disabled={!scheduledStartTimestamp}
              icon={<ReplayRoundedIcon />}
              ref={repeatActionButtonRef}
              onClick={() => setRecurringMenuAnchorEl(repeatActionButtonRef.current)}
            />
          </RepeatButtonDisabledTooltip>
          <LabeledIconButton
            label="Due Date"
            color="inherit"
            icon={<AccessAlarmRoundedIcon />}
            onClick={() => setShowDueDialog(!showDueDialog)}
          />
          <LabeledIconButton
            label="Blockers"
            color="inherit"
            icon={<BlockRoundedIcon />}
            onClick={() => setShowBlockersDialog(!showBlockersDialog)}
          />
        </Box>

        {editTaskDialogId && (
          <Confirm
            onConfirm={() => {
              onClose();
              dispatch(deleteTask(editTaskDialogId));
              notifyInfo('Task Deleted');
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
                color="inherit"
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

      <ScheduledStartDialog
        blockCalendarDisabled={
          !gapiHasAllCalendarScopes || !userHasGrantedCalendarOfflineAccess || calendarCount === 0
        }
        open={showScheduledStartDialog}
        onClose={() => setShowScheduledStartDialog(false)}
        timestamp={scheduledStartTimestamp}
        blocksCalendar={Boolean(calendarBlockStart)}
        calendarBlockCalendarId={calendarBlockCalendarId}
        calendarBlockDuration={
          calendarBlockEnd && calendarBlockStart
            ? differenceInMinutes(calendarBlockEnd, calendarBlockStart)
            : null
        }
        initialDateTimestamp={initialScheduledDateTimestamp}
        onDone={({ timestamp, blocksCalendar, duration, calendarId }) => {
          dispatch(setScheduledStart(timestamp));
          dispatch(setCalendarBlockCalendarId(timestamp && blocksCalendar ? calendarId : null));
          dispatch(setCalendarBlockStart(timestamp && blocksCalendar ? timestamp : null));
          dispatch(
            setCalendarBlockEnd(
              timestamp && blocksCalendar ? addMinutes(timestamp, duration).getTime() : null,
            ),
          );

          // If we remove the scheduled start and there was repeat, also clear it
          if (!timestamp && recurringConfig) {
            dispatch(setRecurringConfig(null));
          }
        }}
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

      {scheduledStartTimestamp && (
        <RecurringConfigMenu
          anchorEl={recurringMenuAnchorEl}
          onClose={() => setRecurringMenuAnchorEl(undefined)}
          onRepeatConfigChange={(config) => dispatch(setRecurringConfig(config))}
          onCustomConfigSelected={() => setRecurringCustomDialogOpen(true)}
          referenceDate={scheduledStartTimestamp}
          currentRecurringConfig={recurringConfig}
        />
      )}

      {scheduledStartTimestamp && (
        <RecurringCustomDialog
          open={recurringCustomDialogOpen}
          initialRecurringConfig={recurringConfig}
          onClose={() => setRecurringCustomDialogOpen(false)}
          onDone={(config) => dispatch(setRecurringConfig(config))}
          referenceDate={scheduledStartTimestamp}
        />
      )}
    </Box>
  );
};

TaskDialogForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  taskId: PropTypes.string,
};

TaskDialogForm.defaultProps = {
  taskId: null,
};

export default TaskDialogForm;
