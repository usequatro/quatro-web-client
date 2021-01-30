import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

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
import { completeTask } from '../../../modules/tasks';
import { selectCalendarColor } from '../../../modules/calendars';
import TextWithLinks from '../../ui/TextWithLinks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import parseHtml from '../../../utils/parseHtml';
import { getTaskPath } from '../../../constants/paths';

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

        {location && (
          <Box display="flex" mb={2}>
            <InformativeIcon title="Location" Icon={RoomRoundedIcon} />
            <Typography variant="body2">
              <TextWithLinks text={location} />
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
            <Button variant="outlined" color="default" component={Link} to={getTaskPath(taskId)}>
              Edit Task
            </Button>

            <Button
              variant="outlined"
              color="default"
              endIcon={<RadioButtonUncheckedRoundedIcon color="action" />}
              onClick={() => {
                dispatch(completeTask(taskId));
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
