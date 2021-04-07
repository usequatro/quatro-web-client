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

import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';

import ReplayRoundedIcon from '@material-ui/icons/ReplayRounded';
import ClearRoundedIcon from '@material-ui/icons/ClearRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import ViewDayIcon from '@material-ui/icons/ViewDay';
import { makeStyles } from '@material-ui/core/styles';

import DatePicker from '../../ui/DatePicker';
import TimePicker from '../../ui/TimePicker';
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
import ScheduledIcon from '../../icons/ScheduledIcon';
import useMobileViewportSize from '../../hooks/useMobileViewportSize';

const useStyles = makeStyles((theme) => ({
  switchHelperText: {
    marginTop: 0,
    marginLeft: theme.spacing(4),
  },
  presetRadioGroup: {
    alignItems: 'flex-start',
  },
  sectionTitle: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
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
      // Show calendar block UI when setting new scheduled date.
      const hasSavedScheduledDate = !timestamp;
      setCurrentBlocksCalendar(Boolean(calendarBlockStart || hasSavedScheduledDate));
      setCurrentTimestamp(timestamp || initialDateTimestamp);
      setCurrentDuration(calendarBlockDuration || defaultDuration);
      setCurrentCalendarId(calendarBlockCalendarId);
    }
    previousOpen.current = open;
  }, [
    open,
    timestamp,
    calendarBlockStart,
    calendarBlockDuration,
    calendarBlockCalendarId,
    defaultDuration,
  ]);

  const mobile = useMobileViewportSize();

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
        iconStart={<ScheduledIcon />}
        title={
          <>
            Scheduled Date
            {/* @TODO: make this tooltip show on touch screens */}
            <Tooltip aria-hidden arrow title={tooltipTitle}>
              <Box ml={1} display="flex">
                <InfoOutlinedIcon fontSize="small" />
              </Box>
            </Tooltip>
          </>
        }
        onClose={onClose}
      />

      <DialogContent dividers={mobile}>
        <Box display="flex" flexDirection="column" mb={4} mt={2}>
          {currentTimestamp && (
            <Box display="flex" flexWrap="wrap" ml={0}>
              <Box flexGrow={1} flexShrink={0} pr={2} pb={2}>
                <DatePicker
                  timestamp={currentTimestamp}
                  onChange={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
                  disablePast
                  minDateMessage="Heads up! That's past already"
                />
              </Box>

              <Box pb={2}>
                <TimePicker
                  showIcon={false}
                  timestamp={currentTimestamp}
                  format="h:mm a"
                  onChangeCommitted={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Box display="flex" flexDirection="column" mb={6}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <Box mr={1} component="span" aria-hidden display="flex">
              <ReplayRoundedIcon />
            </Box>
            Repeat
          </Typography>

          <Box ml={4}>
            <RecurringConfigEditing timestamp={currentTimestamp} />
          </Box>
        </Box>

        <Box display="flex" flexDirection="column">
          <Typography variant="h6" className={classes.sectionTitle}>
            <Box mr={1} component="span" aria-hidden display="flex">
              <ViewDayIcon />
            </Box>
            Calendar Block
          </Typography>

          <Box ml={4}>
            <FormControlLabel
              control={
                <Checkbox
                  disabled={!currentTimestamp}
                  color="primary"
                  checked={Boolean(currentTimestamp && currentBlocksCalendar)}
                  onChange={(event) => setCurrentBlocksCalendar(event.target.checked)}
                  name="blocksCalendar"
                />
              }
              label="Blocks time in connected calendar"
            />

            {recurringConfig && !blockCalendarDisabledReason && currentTimestamp && (
              <FormHelperText className={classes.switchHelperText}>
                Applied to first task only
              </FormHelperText>
            )}
            {blockCalendarDisabledReason && currentTimestamp && (
              <FormHelperText className={classes.switchHelperText}>
                {{
                  access: (
                    <>
                      You need to grant permissions for Google Calendar to block time for this task.
                    </>
                  ),
                  noCalendars: <>You need to connect a calendar to block time for this task.</>,
                }[blockCalendarDisabledReason] || ''}
              </FormHelperText>
            )}

            {/* recurring menu will go here */}

            {currentBlocksCalendar && isValid(currentTimestamp) && (
              <Box mt={2}>
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
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Box flexGrow={1}>
          <Button
            variant="text"
            color="default"
            startIcon={<ClearRoundedIcon />}
            onClick={handleClear}
            style={{ textAlign: 'left' }}
          >
            {timestamp ? 'Clear Scheduled Date' : 'Cancel'}
          </Button>
        </Box>

        <Button
          variant="text"
          color="primary"
          onClick={currentTimestamp ? handleDone : handleClear}
        >
          Apply
        </Button>
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
