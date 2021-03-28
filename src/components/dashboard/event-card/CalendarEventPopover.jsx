import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import format from 'date-fns/format';
import isValid from 'date-fns/isValid';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core/styles';

import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded';
import NotesIcon from '@material-ui/icons/Notes';
import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';
import RoomRoundedIcon from '@material-ui/icons/RoomRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import LockRoundedIcon from '@material-ui/icons/LockRounded';

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
  selectCalendarEventVisibility,
} from '../../../modules/calendarEvents';
import { completeTask, selectTaskShowsAsCompleted, selectTaskExists } from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import TextWithLinks from '../../ui/TextWithLinks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import parseHtml from '../../../utils/parseHtml';
import usePrevious from '../../hooks/usePrevious';
import { getTaskPath } from '../../../constants/paths';
import { PUBLIC, getEventVisibilityLabel } from '../../../constants/eventVisibilities';
import { useNotification } from '../../Notification';

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

const InformativeIcon = ({ Icon, title }) => (
  <Box mr={2} display="flex">
    <Tooltip title={title}>
      <Icon color="action" fontSize="small" />
    </Tooltip>
  </Box>
);

InformativeIcon.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
};

const CalendarEventPopover = ({ id, anchorEl, open, onClose }) => {
  const dispatch = useDispatch();
  const { notifyInfo } = useNotification();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const description = useSelector((state) => selectCalendarEventDescription(state, id));
  const htmlLink = useSelector((state) => selectCalendarEventHtmlLink(state, id));
  const eventLocation = useSelector((state) => selectCalendarEventLocation(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const visibility = useSelector((state) => selectCalendarEventVisibility(state, id));
  const declined = useSelector((state) => selectCalendarEventDeclined(state, id));
  const calendarId = useSelector((state) => selectCalendarEventCalendarId(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));
  const color = useSelector((state) => selectCalendarColor(state, calendarId)) || '#000000';

  const completed = useSelector((state) =>
    taskId ? selectTaskShowsAsCompleted(state, taskId) : false,
  );

  const classes = useStyles({ color, declined });

  const location = useLocation();

  // Close popover when task goes away (likely because task was removed or completed)
  const taskExists = useSelector((state) => (taskId ? selectTaskExists(state, taskId) : false));
  const previouslyTaskExists = usePrevious(taskExists);
  useEffect(() => {
    if (previouslyTaskExists && !taskExists) {
      onClose();
    }
  }, [previouslyTaskExists, taskExists, onClose]);

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
      <DialogTitleWithClose
        TypographyProps={{ id: `event-popover-title-${id}`, variant: 'h5', component: 'h2' }}
        title={summary || '(No title)'}
        onClose={onClose}
      />

      <DialogContent>
        <Box display="flex" mb={2}>
          <InformativeIcon title="Time" Icon={QueryBuilderRoundedIcon} />
          <Typography variant="body2">
            {allDay
              ? 'All Day'
              : `${isValid(startTimestamp) ? format(startTimestamp, 'h:mm a') : ''} - ${
                  isValid(endTimestamp) ? format(endTimestamp, 'h:mm a') : ''
                }`}
          </Typography>
        </Box>

        {eventLocation && (
          <Box display="flex" mb={2}>
            <InformativeIcon title="Location" Icon={RoomRoundedIcon} />
            <Typography variant="body2">
              <TextWithLinks text={eventLocation} />
            </Typography>
          </Box>
        )}

        {description && (
          <Box mb={3} display="flex">
            <InformativeIcon title="Description" Icon={NotesIcon} />

            <Typography
              variant="body2"
              className={classes.eventPopoverDescription}
              dangerouslySetInnerHTML={{
                __html: parseHtml(description),
              }}
            />
          </Box>
        )}

        {/* visibility is missing on GCal quite often */}
        {visibility && (
          <Box display="flex" mb={2}>
            <InformativeIcon
              title="Visibility"
              Icon={visibility === PUBLIC ? LockOpenRoundedIcon : LockRoundedIcon}
            />
            <Typography variant="body2">
              <TextWithLinks text={getEventVisibilityLabel(visibility)} />
            </Typography>
          </Box>
        )}

        <Box display="flex" alignItems="center">
          <Box mr={2} ml={-1.5} display="flex">
            <Tooltip title="Open in Google Calendar" enterDelay={1000} arrow>
              <IconButton
                edge="end"
                color="default"
                href={htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="open in calendar app"
              >
                <LaunchRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography variant="body2">{`${providerCalendarId} `}</Typography>
        </Box>

        {taskId && (
          <DialogActions>
            <Button
              variant="outlined"
              color="default"
              component={Link}
              to={{ pathname: getTaskPath(taskId), search: location.search }}
              onClick={onClose}
            >
              Edit Task
            </Button>

            <Button
              variant="outlined"
              color="default"
              endIcon={
                completed ? (
                  <CheckCircleOutlineRoundedIcon color="primary" />
                ) : (
                  <RadioButtonUncheckedRoundedIcon color="action" />
                )
              }
              onClick={() => {
                dispatch(completeTask(taskId, notifyInfo));
              }}
            >
              Complete Task
            </Button>
          </DialogActions>
        )}
      </DialogContent>
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
