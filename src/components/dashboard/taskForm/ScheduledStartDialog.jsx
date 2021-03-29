import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import isValid from 'date-fns/isValid';
import startOfTomorrow from 'date-fns/startOfTomorrow';
import addHours from 'date-fns/addHours';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import addMinutes from 'date-fns/addMinutes';
import format from 'date-fns/format';
import cond from 'lodash/cond';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Switch from '@material-ui/core/Switch';

import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { makeStyles } from '@material-ui/core/styles';

import DatePicker from '../../ui/DatePicker';
import TimePicker from '../../ui/TimePicker';
import LabeledIconButton from '../../ui/LabeledIconButton';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import { selectCalendarIds, selectCalendarCount } from '../../../modules/calendars';
import {
  selectEffort,
  selectCalendarBlockStart,
  selectCalendarBlockEnd,
  selectScheduledStart,
  selectCalendarBlockCalendarId,
  setScheduledStart,
  setCalendarBlockCalendarId,
  setCalendarBlockStart,
  setCalendarBlockEnd,
  setRecurringConfig,
  selectRecurringConfig,
  selectSnoozedUntil,
  setSnoozedUntil,
} from '../../../modules/taskForm';
import { selectGapiHasAllCalendarScopes } from '../../../modules/session';
import { selectUserHasGrantedGoogleCalendarOfflineAccess } from '../../../modules/userExternalConfig';
import CalendarBlockEditor, {
  ERROR_BAD_DURATION,
  ERROR_NO_CALENDAR_ID,
  ERROR_UNKNOWN_CALENDAR_ID,
} from './CalendarBlockEditor';
import RecurringConfigEditing from './RecurringConfigEditing';
import getUserFacingRecurringText from '../../../utils/getUserFacingRecurringText';
import { EFFORT_TO_DURATION } from '../../../constants/effort';

const useStyles = makeStyles((theme) => ({
  switchHelperText: {
    marginTop: 0,
    marginLeft: theme.spacing(6),
  },
}));

const initialDateTimestamp = addHours(startOfTomorrow(), 9).getTime();

const ScheduledStartDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  // Current taskForm state
  const timestamp = useSelector(selectScheduledStart);
  const snoozedUntilTimestamp = useSelector(selectSnoozedUntil);
  const calendarBlockStart = useSelector(selectCalendarBlockStart);
  const calendarBlockEnd = useSelector(selectCalendarBlockEnd);
  const blocksCalendar = Boolean(calendarBlockStart);
  const calendarBlockCalendarId = useSelector(selectCalendarBlockCalendarId);
  const recurringConfig = useSelector(selectRecurringConfig);
  const calendarBlockDuration =
    calendarBlockEnd && calendarBlockStart
      ? differenceInMinutes(calendarBlockEnd, calendarBlockStart)
      : null;
  const gapiHasAllCalendarScopes = useSelector(selectGapiHasAllCalendarScopes);
  const userHasGrantedCalendarOfflineAccess = useSelector(
    selectUserHasGrantedGoogleCalendarOfflineAccess,
  );
  const calendarCount = useSelector(selectCalendarCount);
  const calendarIds = useSelector(selectCalendarIds);
  const blockCalendarDisabledReason = cond([
    [() => !gapiHasAllCalendarScopes || !userHasGrantedCalendarOfflineAccess, () => 'access'],
    [() => calendarCount === 0, () => 'noCalendars'],
    [() => true, () => ''],
  ])();
  const effort = useSelector(selectEffort);
  const defaultDuration = EFFORT_TO_DURATION[effort] || 15;

  // Non-persisted changes
  const [currentTimestamp, setCurrentTimestamp] = useState(timestamp || initialDateTimestamp);
  const [currentBlocksCalendar, setCurrentBlocksCalendar] = useState(blocksCalendar);
  const [currentDuration, setCurrentDuration] = useState(calendarBlockDuration || defaultDuration);
  const [currentCalendarId, setCurrentCalendarId] = useState(null);

  const [errors, setErrors] = useState([]);

  // Reset state when opening
  const previousOpen = useRef();
  useEffect(() => {
    if (!previousOpen.current && open) {
      setErrors([]);
      setCurrentBlocksCalendar(blocksCalendar);
      setCurrentTimestamp(timestamp || initialDateTimestamp);
      setCurrentDuration(calendarBlockDuration || defaultDuration);
      setCurrentCalendarId(calendarBlockCalendarId);
    }
    previousOpen.current = open;
  }, [
    open,
    timestamp,
    blocksCalendar,
    calendarBlockDuration,
    calendarBlockCalendarId,
    defaultDuration,
  ]);

  const handleDone = () => {
    // validation
    if (currentBlocksCalendar) {
      const currentErrors = [
        !currentCalendarId && ERROR_NO_CALENDAR_ID,
        !calendarIds.includes(currentCalendarId) && ERROR_UNKNOWN_CALENDAR_ID,
        (!currentDuration || currentDuration < 0) && ERROR_BAD_DURATION,
      ].filter(Boolean);
      setErrors(currentErrors);
      if (currentErrors.length) {
        return;
      }
    }

    dispatch(setScheduledStart(currentTimestamp));
    dispatch(
      setCalendarBlockCalendarId(
        currentTimestamp && currentBlocksCalendar ? currentCalendarId : null,
      ),
    );
    dispatch(
      setCalendarBlockStart(currentTimestamp && currentBlocksCalendar ? currentTimestamp : null),
    );
    dispatch(
      setCalendarBlockEnd(
        currentTimestamp && currentBlocksCalendar
          ? addMinutes(currentTimestamp, currentDuration).getTime()
          : null,
      ),
    );

    // If we remove the scheduled start and there was repeat, also clear it
    if (!currentTimestamp && recurringConfig) {
      dispatch(setRecurringConfig(null));
    }
    // If the scheduled start is in the future, and the task was snoozed, we clear the snooze
    if (currentTimestamp && currentTimestamp > Date.now() && snoozedUntilTimestamp) {
      dispatch(setSnoozedUntil(null));
    }

    onClose();
  };

  const handleClear = () => {
    dispatch(setScheduledStart(null));
    dispatch(setCalendarBlockCalendarId(null));
    dispatch(setCalendarBlockStart(null));
    dispatch(setCalendarBlockEnd(null));

    // If we remove the scheduled start and there was repeat, also clear it
    if (recurringConfig) {
      dispatch(setRecurringConfig(null));
    }
    onClose();
  };

  if (!currentTimestamp) {
    return null;
  }

  const tooltipTitle = isValid(currentTimestamp)
    ? `This task will appear in your Top 4 on ${format(currentTimestamp, 'PPPP')} at ${format(
        currentTimestamp,
        'h:mm a',
      )}. ${
        recurringConfig
          ? `It will repeat ${getUserFacingRecurringText(recurringConfig, currentTimestamp, {
              capitalize: false,
            })}.`
          : ''
      }`
    : 'Set the date and time for this task to appear in your Top 4';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="scheduled-start-dialog"
      fullWidth
      maxWidth="xs"
    >
      <DialogTitleWithClose
        TypographyProps={{ id: 'scheduled-start-dialog', variant: 'h6' }}
        title={
          <>
            Scheduled Date
            {/* @TODO: make this tooltip show on touch screens */}
            <Tooltip aria-hidden arrow title={tooltipTitle}>
              <InfoOutlinedIcon fontSize="small" style={{ marginLeft: '8px' }} />
            </Tooltip>
          </>
        }
        onClose={onClose}
      />

      <DialogContent>
        <Box display="flex" mb={3}>
          <DatePicker
            timestamp={currentTimestamp || initialDateTimestamp}
            onChange={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
          />
        </Box>

        <Box display="flex" flexDirection="column" mt={1} mb={3}>
          <TimePicker
            timestamp={currentTimestamp}
            format="h:mm a"
            onChangeCommitted={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
          />
        </Box>

        <Box display="flex" flexDirection="column" mt={1} mb={3}>
          <RecurringConfigEditing timestamp={currentTimestamp} />
        </Box>

        <Divider />
        <Box mb={2} />

        <FormControlLabel
          disabled={Boolean(blockCalendarDisabledReason)}
          control={
            <Switch
              checked={currentBlocksCalendar}
              onChange={(event) => setCurrentBlocksCalendar(event.target.checked)}
              name="blocksCalendar"
              color="primary"
            />
          }
          label="Block time in connected calendar"
        />
        {recurringConfig && !blockCalendarDisabledReason && (
          <FormHelperText className={classes.switchHelperText}>
            Applied to first task only
          </FormHelperText>
        )}
        {blockCalendarDisabledReason && (
          <FormHelperText className={classes.switchHelperText}>
            {{
              access: (
                <>You need to grant permissions for Google Calendar to block time for this task.</>
              ),
              noCalendars: <>You need to connect a calendar to block time for this task.</>,
            }[blockCalendarDisabledReason] || ''}
          </FormHelperText>
        )}

        {/* recurring menu will go here */}

        {currentBlocksCalendar && isValid(currentTimestamp) && (
          <Box mt={2} mb={2}>
            <CalendarBlockEditor
              startDateTimestamp={currentTimestamp}
              onChangeStartDateTimestamp={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
              duration={currentDuration}
              onDurationChange={(newDuration) => setCurrentDuration(newDuration)}
              calendarId={currentCalendarId}
              onCalendarIdChange={(newCalendarId) => setCurrentCalendarId(newCalendarId)}
              errors={errors}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Box flexGrow={1}>
          <LabeledIconButton
            color="inherit"
            label="Clear"
            icon={<ClearRoundedIcon />}
            onClick={handleClear}
          />
        </Box>

        <LabeledIconButton
          label="Done"
          icon={<SendRoundedIcon />}
          color="primary"
          onClick={handleDone}
        />
      </DialogActions>
    </Dialog>
  );
};

ScheduledStartDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

ScheduledStartDialog.defaultProps = {};

export default ScheduledStartDialog;
