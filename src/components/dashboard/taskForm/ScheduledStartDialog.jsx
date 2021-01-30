import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import isValid from 'date-fns/isValid';
import format from 'date-fns/format';

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

import DatePicker from '../../ui/DatePicker';
import TimePicker from '../../ui/TimePicker';
import LabeledIconButton from '../../ui/LabeledIconButton';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import { selectCalendarIds } from '../../../modules/calendars';
import CalendarBlockEditor, {
  ERROR_BAD_DURATION,
  ERROR_NO_CALENDAR_ID,
  ERROR_UNKNOWN_CALENDAR_ID,
} from './CalendarBlockEditor';

const ScheduledStartDialog = ({
  open,
  onClose,
  timestamp,
  onDone,
  initialDateTimestamp,
  blocksCalendar,
  calendarBlockCalendarId,
  calendarBlockDuration,
  blockCalendarDisabledReason,
}) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(timestamp || initialDateTimestamp);

  // Calendar blocking
  const [currentlyBlocksCalendar, setBlocksCalendar] = useState(blocksCalendar);
  const [duration, setDuration] = useState(calendarBlockDuration || 15);
  const [calendarId, setCalendarId] = useState(null);

  const [errors, setErrors] = useState([]);

  const calendarIds = useSelector(selectCalendarIds);

  // Reset state when opening
  const previousOpen = useRef();
  useEffect(() => {
    if (!previousOpen.current && open) {
      setErrors([]);
      setBlocksCalendar(blocksCalendar);
      setCurrentTimestamp(timestamp || initialDateTimestamp);
      setDuration(calendarBlockDuration || 15);
      setCalendarId(calendarBlockCalendarId);
    }
    previousOpen.current = open;
  }, [
    open,
    timestamp,
    blocksCalendar,
    calendarBlockDuration,
    initialDateTimestamp,
    calendarBlockCalendarId,
  ]);

  const handleClear = () => {
    onClose();
    onDone({
      timestamp: null,
      blocksCalendar: false,
      duration: 0,
      calendarId: null,
    });
  };

  const handleDone = () => {
    // validation
    if (currentlyBlocksCalendar) {
      const currentErrors = [
        !calendarId && ERROR_NO_CALENDAR_ID,
        !calendarIds.includes(calendarId) && ERROR_UNKNOWN_CALENDAR_ID,
        (!duration || duration < 0) && ERROR_BAD_DURATION,
      ].filter(Boolean);
      setErrors(currentErrors);
      if (currentErrors.length) {
        return;
      }
    }

    onClose();
    onDone({
      timestamp: currentTimestamp,
      blocksCalendar: currentlyBlocksCalendar,
      duration,
      calendarId,
    });
  };

  if (!currentTimestamp) {
    return null;
  }

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
            <Tooltip
              aria-hidden
              arrow
              title={
                isValid(currentTimestamp)
                  ? `This task will appear in your Top 4 on ${format(
                      currentTimestamp,
                      'PPPP',
                    )} at ${format(currentTimestamp, 'h:mm a')}`
                  : 'Set the date and time for this task to appear in your Top 4'
              }
            >
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

        <Divider />
        <Box mb={2} />

        <FormControlLabel
          disabled={Boolean(blockCalendarDisabledReason)}
          control={
            <Switch
              checked={currentlyBlocksCalendar}
              onChange={(event) => setBlocksCalendar(event.target.checked)}
              name="blocksCalendar"
              color="primary"
            />
          }
          label="Block time in connected calendar"
        />
        {blockCalendarDisabledReason && (
          <FormHelperText>
            {{
              access: (
                <>You need to grant permissions for Google Calendar to block time for this task.</>
              ),
              noCalendars: <>You need to connect a calendar to block time for this task.</>,
            }[blockCalendarDisabledReason] || ''}
          </FormHelperText>
        )}

        {currentlyBlocksCalendar && isValid(currentTimestamp) && (
          <Box mt={2} mb={2}>
            <CalendarBlockEditor
              startDateTimestamp={currentTimestamp}
              onChangeStartDateTimestamp={(newTimestamp) => setCurrentTimestamp(newTimestamp)}
              duration={duration}
              onDurationChange={(newDuration) => setDuration(newDuration)}
              calendarId={calendarId}
              onCalendarIdChange={(newCalendarId) => setCalendarId(newCalendarId)}
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
  timestamp: PropTypes.number,
  blocksCalendar: PropTypes.bool.isRequired,
  calendarBlockDuration: PropTypes.number,
  onDone: PropTypes.func.isRequired,
  initialDateTimestamp: PropTypes.number.isRequired,
  calendarBlockCalendarId: PropTypes.string,
  blockCalendarDisabledReason: PropTypes.string.isRequired,
};

ScheduledStartDialog.defaultProps = {
  timestamp: null,
  calendarBlockDuration: null,
  calendarBlockCalendarId: null,
};

export default ScheduledStartDialog;
