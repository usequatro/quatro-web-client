import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import format from 'date-fns/format';
import isValid from 'date-fns/isValid';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';

import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded';

import {
  selectCalendarEventSummary,
  selectCalendarEventDescription,
  selectCalendarEventHtmlLink,
  selectCalendarEventLocation,
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventDeclined,
  selectCalendarEventCalendarId,
  selectCalendarEventTaskId,
  selectCalendarEventProviderCalendarId,
} from '../../../modules/calendarEvents';
import { completeTask, markTaskIncomplete } from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import TextWithLinks from '../../ui/TextWithLinks';
import parseHtml from '../../../utils/parseHtml';
import CompleteButton from '../tasks/CompleteButton';

const useStyles = makeStyles((theme) => ({
  eventPopoverPaper: {
    overflowWrap: 'break-word',
    [theme.breakpoints.up('md')]: {
      maxWidth: '60vw !important',
    },
  },
  eventPopoverName: {
    flexGrow: 1,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
  eventPopoverDescription: {
    whiteSpace: 'pre-wrap',
  },
}));

const CalendarEventPopover = ({ id, anchorEl, open, onClose }) => {
  const dispatch = useDispatch();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const description = useSelector((state) => selectCalendarEventDescription(state, id));
  const htmlLink = useSelector((state) => selectCalendarEventHtmlLink(state, id));
  const location = useSelector((state) => selectCalendarEventLocation(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const declined = useSelector((state) => selectCalendarEventDeclined(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const classes = useStyles({ color, declined });

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      classes={{ paper: classes.eventPopoverPaper }}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      transformOrigin={{ horizontal: 'center', vertical: 'top' }}
      aria-labelledby={`event-popover-title-${id}`}
    >
      <Box px={3} pt={1} pb={3}>
        <Box display="flex" alignItems="flex-start">
          <Typography
            className={classes.eventPopoverName}
            variant="h5"
            component="h2"
            id={`event-popover-title-${id}`}
          >
            {summary || '(No title)'}
          </Typography>

          {taskId && (
            <CompleteButton
              taskId={taskId}
              completed={null}
              onCompleteTask={() => dispatch(completeTask(taskId))}
              onMarkTaskIncomplete={() => dispatch(markTaskIncomplete(taskId))}
              fontSize="default"
            />
          )}
        </Box>
        <Typography variant="body2" gutterBottom>
          {allDay
            ? 'All Day'
            : `${isValid(startTimestamp) ? format(startTimestamp, 'h:mm a') : ''} - ${
                isValid(endTimestamp) ? format(endTimestamp, 'h:mm a') : ''
              }`}
        </Typography>

        {location && (
          <Typography variant="body2">
            <TextWithLinks text={location} />
          </Typography>
        )}
      </Box>

      {description && (
        <Box px={3} pb={3}>
          <Typography
            variant="body2"
            className={classes.eventPopoverDescription}
            dangerouslySetInnerHTML={{
              __html: parseHtml(description),
            }}
          />
        </Box>
      )}

      <Box px={3} pb={3}>
        <Typography variant="body2">
          {`Calendar: ${providerCalendarId} `}

          <Tooltip title="Open in Google Calendar" enterDelay={1000} arrow>
            <IconButton
              edge="end"
              size="small"
              color="inherit"
              href={htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="open in calendar app"
            >
              <LaunchRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
      </Box>
    </Popover>
  );
};

CalendarEventPopover.propTypes = {
  id: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  anchorEl: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

CalendarEventPopover.defaultProps = {
  anchorEl: undefined,
};

export default memo(CalendarEventPopover);
