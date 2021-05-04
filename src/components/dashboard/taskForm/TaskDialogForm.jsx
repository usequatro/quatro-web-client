import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import cond from 'lodash/cond';
import invert from 'lodash/invert';
import isPast from 'date-fns/isPast';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Tooltip from '@material-ui/core/Tooltip';
import Box from '@material-ui/core/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';

import AccessAlarmRoundedIcon from '@material-ui/icons/AccessAlarmRounded';
import NotesIcon from '@material-ui/icons/Notes';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';
import CloseIcon from '@material-ui/icons/Close';
import SnoozeIcon from '@material-ui/icons/Snooze';

import { deleteTask, selectTaskDashboardTab } from '../../../modules/tasks';
import {
  selectFormTitle,
  selectFormDescription,
  selectFormImpact,
  selectFormEffort,
  selectFormScheduledStart,
  selectFormSnoozedUntil,
  selectFormDue,
  selectFormBlockedBy,
  selectFormBlockedByTaskIds,
  selectFormRecurringConfig,
  selectFormCalendarBlockStart,
  selectFormCalendarBlockEnd,
  setFormTitle,
  setFormDescription,
  setFormImpact,
  setFormEffort,
  addFormTaskBlocker,
  addFormFreeTextBlocker,
  removeFormBlockerByIndex,
  setTaskInForm,
  selectFormHasRecurringConfig,
  selectFormRecurringConfigId,
  saveForm,
  selectThunkTaskChangesApplicableToRecurringConfig,
  selectFormTaskId,
  FIELD_RECURRENCE,
} from '../../../modules/taskForm';
import Confirm from '../../ui/Confirm';
import { TextFieldWithTypography } from '../../ui/InputWithTypography';
import DueDateDialog from './DueDateDialog';
import ScheduledStartDialog from './ScheduledStartDialog';
import SnoozeCustomDialog from './SnoozeCustomDialog';
import SnoozeMenu from './SnoozeMenu';
import ConfirmationDialog from '../../ui/ConfirmationDialog';
import BlockerSelectionDialog from '../tasks/BlockerSelectionDialog';
import { useNotification } from '../../Notification';
import * as blockerTypes from '../../../constants/blockerTypes';
import TaskTitle from '../tasks/TaskTitle';
import SliderField from '../../ui/SliderField';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';
import formatDateTime from '../../../utils/formatDateTime';
import { IMPACT_LABELS, IMPACT_SLIDER_MARKS } from '../../../constants/impact';
import { EFFORT_LABELS, EFFORT_SLIDER_MARKS } from '../../../constants/effort';
import useIsTouchEnabledScreen from '../../hooks/useIsTouchEnabledScreen';
import ScheduledIcon from '../../icons/ScheduledIcon';
import BlockedIcon from '../../icons/BlockedIcon';
import useMobileViewportSize from '../../hooks/useMobileViewportSize';
import { PATHS_TO_DASHBOARD_TABS } from '../../../constants/paths';
import { SECTION_TITLES_BY_TAB } from '../../../constants/dashboardTabs';
import { selectDashboardActiveTab } from '../../../modules/dashboard';
import getApproximatedEffortToCalendarBlockDuration from '../../../utils/getApproximatedEffortToCalendarBlockDuration';

const DASHBOARD_TABS_TO_PATHS = invert(PATHS_TO_DASHBOARD_TABS);

const useStyles = makeStyles((theme) => ({
  dialogActionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogContent: {
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      width: '500px',
      maxWidth: '100%',
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
  blockersList: {
    flexGrow: 1,
  },
  inputStartIcon: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  descriptionField: {
    '&::before, &::after': {
      opacity: 0.5,
    },
  },
  closeButtonContainer: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

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
    <Tooltip title="Add a Scheduled Date to enable" enterDelay={0} arrow>
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

const RecurringLabelValue = () => {
  const recurringConfig = useSelector(selectFormRecurringConfig);
  const scheduledStartTimestamp = useSelector(selectFormScheduledStart);

  return `Repeats ${getUserFacingRecurringText(recurringConfig, scheduledStartTimestamp, {
    capitalize: false,
  })}`;
};

const SavedNotificationAction = ({ renderButton, taskId }) => {
  const tabTask = useSelector((state) => selectTaskDashboardTab(state, taskId));
  const dashboardActiveTab = useSelector(selectDashboardActiveTab);
  if (tabTask !== dashboardActiveTab && DASHBOARD_TABS_TO_PATHS[tabTask]) {
    return renderButton({
      component: Link,
      to: DASHBOARD_TABS_TO_PATHS[tabTask],
      children: `See ${SECTION_TITLES_BY_TAB[tabTask] || 'tab'}`,
    });
  }
  return null;
};
SavedNotificationAction.propTypes = {
  taskId: PropTypes.string.isRequired,
  renderButton: PropTypes.func.isRequired,
};

const TaskDialogForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const { notifyError, notifyInfo } = useNotification();

  const taskId = useSelector(selectFormTaskId);
  const newTaskDialogOpen = !taskId;

  // This will be defined if we're editing a task
  const editTaskDialogId = taskId;
  // This will be defined if the task we're editing has a recurring config
  const editRecurringConfigId = useSelector((state) => selectFormRecurringConfigId(state));

  const title = useSelector(selectFormTitle);
  const description = useSelector(selectFormDescription);
  const impact = useSelector(selectFormImpact);
  const effort = useSelector(selectFormEffort);
  const scheduledStartTimestamp = useSelector(selectFormScheduledStart);
  const snoozedUntilTimestamp = useSelector(selectFormSnoozedUntil);
  const dueTimestamp = useSelector(selectFormDue);
  const blockedBy = useSelector(selectFormBlockedBy);
  const blockedByTaskIds = useSelector(selectFormBlockedByTaskIds);
  const calendarBlockStart = useSelector(selectFormCalendarBlockStart);
  const calendarBlockEnd = useSelector(selectFormCalendarBlockEnd);

  const formHasRecurringConfig = useSelector(selectFormHasRecurringConfig);

  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);
  const [showDueDialog, setShowDueDialog] = useState(false);
  const [showSnoozedUntilDialog, setShowSnoozedUntilDialog] = useState(false);
  const [showScheduledStartDialog, setShowScheduledStartDialog] = useState(false);
  const [showBlockersDialog, setShowBlockersDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [recurringChangesToConfirm, setRecurringChangesToConfirm] = useState([]);
  const [appliesChangesRecurringly, setAppliesChangesRecurringly] = useState(false);

  const snoozeButtonRef = useRef();

  const mobile = useMobileViewportSize();

  // On opening edit task modal, load task data
  useEffect(() => {
    if (editTaskDialogId) {
      dispatch(setTaskInForm(editTaskDialogId));
    }
  }, [editTaskDialogId, dispatch]);

  useEffect(() => {
    if (calendarBlockStart && calendarBlockEnd) {
      const durationMs = calendarBlockEnd - calendarBlockStart;
      const durationM = durationMs / (1000 * 60);
      const approximatedEffort = getApproximatedEffortToCalendarBlockDuration(durationM);
      dispatch(setFormEffort(approximatedEffort));
    }
  }, [calendarBlockStart, calendarBlockEnd, dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const errors = [title.trim() === '' && 'title'].filter(Boolean);
    setValidationErrors(errors);
    if (errors.length) {
      return;
    }

    const changes = dispatch(selectThunkTaskChangesApplicableToRecurringConfig());
    const changesThatNeedConfirmation = changes.filter((c) => c !== FIELD_RECURRENCE);
    if (
      editRecurringConfigId &&
      changesThatNeedConfirmation.length > 0 &&
      !recurringChangesToConfirm.length > 0
    ) {
      setRecurringChangesToConfirm(changesThatNeedConfirmation);
      return;
    }
    if (recurringChangesToConfirm.length > 0) {
      setRecurringChangesToConfirm([]);
    }

    setSubmitting(true);

    // if only applying changes to this task, we at least apply the repeat cadence change
    const recurringChangesToPersist = appliesChangesRecurringly
      ? changes
      : changes.filter((c) => c === FIELD_RECURRENCE);

    dispatch(
      saveForm({
        recurringConfigTaskDetailsChanged: recurringChangesToPersist,
      }),
    )
      .then((result) => {
        setSubmitting(false);
        onClose();

        notifyInfo({
          message: result.taskCreated ? 'Task created' : 'Task updated',
          ButtonListComponent: function CustomButtonListComponent({ ...props }) {
            return <SavedNotificationAction taskId={result.taskId} {...props} />;
          },
        });
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error); // eslint-disable-line no-console
        notifyError('Error saving task');
      });
  };

  const handleDelete = () => {
    onClose();
    dispatch(deleteTask(editTaskDialogId, { appliesChangesRecurringly }));
    notifyInfo('Task deleted');
  };

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
      id="task-dialog-form"
      component="form"
      display="flex"
      height="100%"
      flexDirection="column"
      // hitting ENTER with anything focused inside the form will make it submit :)
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          handleSubmit(event);
        }
      }}
    >
      <DialogContent className={classes.dialogContent} id="task-dialog-content" dividers={mobile}>
        <Box pt={2} pb={4} display="flex" flexDirection="column" alignItems="stretch">
          <Box pb={2}>
            <TextFieldWithTypography
              typography="h6"
              fullWidth
              aria-label="What do you need to do?"
              placeholder="What do you need to do?"
              className={classes.titleTextField}
              // Autofocus with real keyboard, not when screen keyboard because it's annoying
              autoFocus={!isTouchEnabledScreen}
              multiline
              rowsMax={3}
              value={title}
              onChange={(event) => {
                dispatch(setFormTitle(event.target.value));
                if (validationErrors.includes('title')) {
                  setValidationErrors(validationErrors.filter((e) => e !== 'title'));
                }
              }}
              onBlur={() => {
                // Prevent leaving whitespaces saved at beginning or end
                if (title !== title.trim()) {
                  dispatch(setFormTitle(title.trim()));
                }
              }}
              error={validationErrors.includes('title')}
            />
          </Box>

          <Box>
            <TextField
              placeholder="Notes"
              aria-label="Notes"
              fullWidth
              multiline
              rows={1}
              rowsMax={10}
              value={description}
              InputProps={{
                startAdornment: (
                  <Tooltip title="Notes" arrow enterDelay={500} placement="top">
                    <InputAdornment position="start" className={classes.inputStartIcon}>
                      <NotesIcon />
                    </InputAdornment>
                  </Tooltip>
                ),
                className: classes.descriptionField,
              }}
              onChange={(event) => dispatch(setFormDescription(event.target.value))}
            />
          </Box>
        </Box>

        <Box pt={2} pb={4} display="flex">
          <Box width="50%" mr={mobile ? 4 : 8}>
            <SliderField
              id="impact-slider"
              label="Impact"
              tooltipTitle="How much impact will this task have on your goals?"
              value={impact}
              getValueText={(i) => IMPACT_LABELS[i] || '-'}
              onChange={(value) => dispatch(setFormImpact(value))}
              marks={IMPACT_SLIDER_MARKS}
            />
          </Box>
          <Box width="50%">
            <SliderField
              id="effort-slider"
              label="Time"
              tooltipTitle="How much time will this task require?"
              value={effort}
              getValueText={(e) => EFFORT_LABELS[e] || '-'}
              onChange={(value) => dispatch(setFormEffort(value))}
              marks={EFFORT_SLIDER_MARKS}
            />
          </Box>
        </Box>

        <Box pt={0} pb={0} display="flex" flexDirection="column" alignItems="flexStart">
          <Button
            onClick={() => setShowScheduledStartDialog(true)}
            startIcon={<ScheduledIcon />}
            className={classes.settingButton}
            color={scheduledStartTimestamp ? 'primary' : 'default'}
          >
            {scheduledStartTimestamp
              ? `Scheduled date: ${formatDateTime(scheduledStartTimestamp)}`
              : 'No scheduled date'}

            {formHasRecurringConfig && (
              <>
                <br />
                <RecurringLabelValue />
              </>
            )}

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

          <Button
            onClick={() => setShowDueDialog(true)}
            startIcon={
              <AccessAlarmRoundedIcon
                color={dueTimestamp && isPast(dueTimestamp) ? 'error' : 'inherit'}
              />
            }
            className={classes.settingButton}
            color={dueTimestamp ? 'primary' : 'default'}
          >
            {dueTimestamp ? `Due date: ${formatDateTime(dueTimestamp)}` : 'No due date'}
          </Button>

          <Button
            component="div"
            onClick={() => setShowBlockersDialog(true)}
            className={classes.settingButton}
            startIcon={
              <Tooltip title="Add Blocker" arrow>
                <Box component="span" display="flex">
                  <BlockedIcon fontSize="small" />
                </Box>
              </Tooltip>
            }
          >
            <List disablePadding className={classes.blockersList}>
              {blockedBy && blockedBy.length
                ? blockedBy.map((blockerDescriptor, index) => (
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
                            onClick={(event) => {
                              event.stopPropagation();
                              dispatch(removeFormBlockerByIndex(index));
                            }}
                          >
                            <ClearRoundedIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))
                : 'No blockers'}
            </List>
          </Button>
        </Box>
      </DialogContent>

      <DialogActions className={classes.dialogActionBar} disableSpacing>
        <Box flexGrow={1}>
          {editTaskDialogId && (
            <Confirm
              onConfirm={handleDelete}
              renderDialog={(open, onConfirm, onConfirmationClose) => (
                <ConfirmationDialog
                  open={open}
                  onClose={onConfirmationClose}
                  onConfirm={onConfirm}
                  id="confirm-delete-task"
                  title="Delete task"
                  body={
                    <>
                      <DialogContentText>
                        Are you sure you want to delete this task?
                      </DialogContentText>
                      {editRecurringConfigId && (
                        <RadioGroup
                          value={appliesChangesRecurringly ? '1' : '0'}
                          onChange={(event) => {
                            setAppliesChangesRecurringly(event.target.value === '1');
                          }}
                        >
                          <FormControlLabel
                            value="0"
                            label="Only this task"
                            control={<Radio size="small" />}
                          />
                          <FormControlLabel
                            value="1"
                            label="This and following tasks"
                            control={<Radio size="small" />}
                          />
                        </RadioGroup>
                      )}
                    </>
                  }
                  buttonText="Delete"
                />
              )}
              renderContent={(onClick) =>
                mobile ? (
                  <IconButton
                    edge="start"
                    size="small"
                    color="inherit"
                    onClick={onClick}
                    aria-label="delete"
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                ) : (
                  <Button
                    variant="outlined"
                    color="default"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={onClick}
                  >
                    Delete
                  </Button>
                )
              }
            />
          )}
        </Box>

        <Box ml={2} display="flex" alignItems="center">
          {!(scheduledStartTimestamp && scheduledStartTimestamp > Date.now()) && (
            <Box>
              {mobile ? (
                <IconButton
                  edge="start"
                  size="small"
                  color={
                    snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()
                      ? 'primary'
                      : 'inherit'
                  }
                  onClick={() => setSnoozeMenuOpen(true)}
                  aria-label={
                    snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()
                      ? 'Snoozed'
                      : 'Snooze'
                  }
                  ref={snoozeButtonRef}
                  style={{ marginRight: '1em' }}
                >
                  <SnoozeIcon />
                </IconButton>
              ) : (
                <Button
                  variant="outlined"
                  color={
                    snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()
                      ? 'primary'
                      : 'default'
                  }
                  style={{ marginRight: '1em' }}
                  startIcon={<SnoozeIcon />}
                  ref={snoozeButtonRef}
                  onClick={() => setSnoozeMenuOpen(true)}
                >
                  {snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now()
                    ? 'Snoozed'
                    : 'Snooze'}
                </Button>
              )}
            </Box>
          )}

          <Button
            variant="outlined"
            color="primary"
            type="submit"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress thickness={6} size="1rem" /> : <SendRoundedIcon />
            }
          >
            {`${ctaText}`}
          </Button>
        </Box>
      </DialogActions>

      <Dialog
        open={recurringChangesToConfirm.length > 0}
        onClose={() => setRecurringChangesToConfirm([])}
        aria-labelledby="apply-recurring-changes-dialog"
      >
        <DialogTitle id="apply-recurring-changes-dialog">Edit repeating task</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={appliesChangesRecurringly ? '1' : '0'}
            onChange={(event) => setAppliesChangesRecurringly(event.target.value === '1')}
          >
            <FormControlLabel value="0" label="This task" control={<Radio size="small" />} />
            <FormControlLabel
              value="1"
              label="This and future tasks"
              control={<Radio size="small" />}
            />

            <Box pb={2} />

            <Typography variant="body2" color="textSecondary" gutterBottom>
              Changes made that would apply to future tasks:
            </Typography>
            <Box component="ul" m={0} pl={2}>
              {recurringChangesToConfirm.map((field) => (
                <Typography key={field} component="li" variant="body2" color="textSecondary">
                  {{
                    title: `Title`,
                    description: `Description`,
                    impact: `Impact`,
                    effort: `Time`,
                    scheduledStart: `Scheduled date`,
                    due: `Due date`,
                  }[field] || '-'}
                </Typography>
              ))}
            </Box>
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecurringChangesToConfirm([])} variant="text">
            Cancel
          </Button>
          <Button variant="text" color="primary" autoFocus type="submit" form="task-dialog-form">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {snoozedUntilTimestamp && snoozedUntilTimestamp > Date.now() && (
        <DialogActions style={{ paddingTop: 0 }}>
          <Typography variant="caption">
            Snoozed until: {formatDateTime(snoozedUntilTimestamp)}
          </Typography>
        </DialogActions>
      )}

      <Box className={classes.closeButtonContainer}>
        <IconButton edge="end" size="small" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <ScheduledStartDialog
        open={showScheduledStartDialog}
        onClose={() => setShowScheduledStartDialog(false)}
      />

      <SnoozeMenu
        open={snoozeMenuOpen}
        onClose={() => setSnoozeMenuOpen(false)}
        onCustomSelected={() => setShowSnoozedUntilDialog(true)}
        anchorEl={snoozeButtonRef.current}
      />

      <DueDateDialog open={showDueDialog} onClose={() => setShowDueDialog(false)} />

      <SnoozeCustomDialog
        open={showSnoozedUntilDialog}
        onClose={() => setShowSnoozedUntilDialog(false)}
      />

      <BlockerSelectionDialog
        open={showBlockersDialog}
        onClose={() => setShowBlockersDialog(false)}
        onSelect={(id) => {
          dispatch(addFormTaskBlocker(id));
          runDelayed(scrollToBottom, 150);
        }}
        onFreeTextEntered={(value) => {
          dispatch(addFormFreeTextBlocker(value));
          runDelayed(scrollToBottom, 150);
        }}
        disabledTasks={blockedByTaskIds}
        hiddenTasks={editTaskDialogId ? [editTaskDialogId] : []}
      />
    </Box>
  );
};

TaskDialogForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

TaskDialogForm.defaultProps = {};

export default TaskDialogForm;
