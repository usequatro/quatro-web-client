import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import format from 'date-fns/format';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';

import GroupRoundedIcon from '@material-ui/icons/GroupRounded';
import HowToRegIcon from '@material-ui/icons/HowToReg';
import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded';
import NotesIcon from '@material-ui/icons/Notes';
import QueryBuilderRoundedIcon from '@material-ui/icons/QueryBuilderRounded';
import RoomRoundedIcon from '@material-ui/icons/RoomRounded';
import RadioButtonUncheckedRoundedIcon from '@material-ui/icons/RadioButtonUncheckedRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import LockOpenRoundedIcon from '@material-ui/icons/LockOpenRounded';
import LockRoundedIcon from '@material-ui/icons/LockRounded';
import HelpOutlineRoundedIcon from '@material-ui/icons/HelpOutlineRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import NotInterestedRoundedIcon from '@material-ui/icons/NotInterestedRounded';

import { gapiUpdateCalendarEventResponseStatus } from '../../../googleApi';

import {
  selectCalendarEventSummary,
  selectCalendarEventDescription,
  selectCalendarEventHtmlLink,
  selectCalendarEventLocation,
  selectCalendarEventAttendees,
  selectCalendarEventResponseStatus,
  selectCalendarEventStartTimestamp,
  selectCalendarEventEndTimestamp,
  selectCalendarEventAllDay,
  selectCalendarEventTaskId,
  selectCalendarEventProviderCalendarId,
  selectCalendarEventVisibility,
} from '../../../modules/calendarEvents';
import { completeTask, selectTaskShowsAsCompleted, selectTaskExists } from '../../../modules/tasks';
import TextWithLinks from '../../ui/TextWithLinks';
import DialogTitleWithClose from '../../ui/DialogTitleWithClose';
import parseHtml from '../../../utils/parseHtml';
import usePrevious from '../../hooks/usePrevious';
import { getTaskPath } from '../../../constants/paths';
import * as RESPONSE_STATUS from '../../../constants/responseStatus';
import { PUBLIC, getEventVisibilityLabel } from '../../../constants/eventVisibilities';
import { useNotification } from '../../Notification';
import CalendarEventConferenceEntryPoints from './CalendarEventConferenceEntryPoints';

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
    // removing top padding on paragraphs in the description, when it comes as HTML
    '& > p': {
      marginTop: 0,
    },
  },
}));

const AttendeeStatusIcon = ({ responseStatus }) => {
  const commonProps = {
    fontSize: 'small',
    color: 'action',
    style: { fontSize: '1em', marginLeft: '0.5em' },
  };
  switch (responseStatus) {
    case RESPONSE_STATUS.ACCEPTED:
      return <CheckRoundedIcon titleAccess="Accepted" {...commonProps} />;
    case RESPONSE_STATUS.DECLINED:
      return <NotInterestedRoundedIcon titleAccess="Declined" {...commonProps} />;
    case RESPONSE_STATUS.TENTATIVE:
      return <HelpOutlineRoundedIcon titleAccess="Maybe" {...commonProps} />;
    case RESPONSE_STATUS.NEEDS_ACTION:
    default:
      return null;
  }
};

AttendeeStatusIcon.propTypes = {
  responseStatus: PropTypes.oneOf([
    RESPONSE_STATUS.ACCEPTED,
    RESPONSE_STATUS.DECLINED,
    RESPONSE_STATUS.TENTATIVE,
    RESPONSE_STATUS.NEEDS_ACTION,
  ]).isRequired,
};

const LayoutRow = ({ Icon, iconTooltip, content, BoxProps = {} }) => (
  <Box mb={2} display="flex" {...BoxProps}>
    <Box mr={2} display="flex">
      <Tooltip title={iconTooltip} arrow>
        {React.isValidElement(Icon) ? Icon : <Icon color="action" fontSize="small" />}
      </Tooltip>
    </Box>

    <Box>{content}</Box>
  </Box>
);
LayoutRow.propTypes = {
  Icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element]).isRequired,
  iconTooltip: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired,
  BoxProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};
LayoutRow.defaultProps = {
  BoxProps: {},
};

const ATTENDEE_RENDER_LIMIT = 15;

const CalendarEventPopover = ({ id, anchorEl, open, onClose }) => {
  const dispatch = useDispatch();
  const { notifyInfo, notifyError } = useNotification();

  const summary = useSelector((state) => selectCalendarEventSummary(state, id));
  const description = useSelector((state) => selectCalendarEventDescription(state, id));
  const htmlLink = useSelector((state) => selectCalendarEventHtmlLink(state, id));
  const eventLocation = useSelector((state) => selectCalendarEventLocation(state, id));
  const attendees = useSelector((state) => selectCalendarEventAttendees(state, id));
  const responseStatus = useSelector((state) => selectCalendarEventResponseStatus(state, id));
  const providerCalendarId = useSelector((state) =>
    selectCalendarEventProviderCalendarId(state, id),
  );
  const startTimestamp = useSelector((state) => selectCalendarEventStartTimestamp(state, id));
  const endTimestamp = useSelector((state) => selectCalendarEventEndTimestamp(state, id));
  const allDay = useSelector((state) => selectCalendarEventAllDay(state, id));
  const visibility = useSelector((state) => selectCalendarEventVisibility(state, id));
  const taskId = useSelector((state) => selectCalendarEventTaskId(state, id));

  const completed = useSelector((state) =>
    taskId ? selectTaskShowsAsCompleted(state, taskId) : false,
  );

  const classes = useStyles();

  const location = useLocation();

  // Close popover when task goes away (likely because task was removed or completed)
  const taskExists = useSelector((state) => (taskId ? selectTaskExists(state, taskId) : false));
  const previouslyTaskExists = usePrevious(taskExists);
  useEffect(() => {
    if (previouslyTaskExists && !taskExists) {
      onClose();
    }
  }, [previouslyTaskExists, taskExists, onClose]);

  const timeFormat =
    differenceInCalendarDays(endTimestamp, startTimestamp) < 1 ? 'h:mm a' : 'PP - h:mm a';

  const attendeesRenderSubset =
    attendees.length > ATTENDEE_RENDER_LIMIT
      ? attendees.slice(0, ATTENDEE_RENDER_LIMIT)
      : attendees;

  const [calendarEventResponseStatus, setCalendarEventResponseStatus] = useState(responseStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleSelectChange = (event) => {
    const updatedResponseStatus = event.target.value;
    if (isUpdating) {
      return;
    }
    setIsUpdating(true);
    onClose();
    notifyInfo({ message: 'Event updated' });
    setCalendarEventResponseStatus(updatedResponseStatus);
    const eventId = id.split('-').pop();
    gapiUpdateCalendarEventResponseStatus(
      providerCalendarId,
      eventId,
      updatedResponseStatus,
      attendees,
    )
      .then(() => {
        setIsUpdating(false);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        notifyError("Couldn't update the response");
        setIsUpdating(false);
      });
  };

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
        <LayoutRow
          Icon={QueryBuilderRoundedIcon}
          iconTooltip="Time"
          content={
            <Typography variant="body2">
              {allDay
                ? 'All Day'
                : `${format(startTimestamp, timeFormat)} - ${format(endTimestamp, timeFormat)}`}
            </Typography>
          }
        />

        {eventLocation && (
          <LayoutRow
            Icon={RoomRoundedIcon}
            iconTooltip="Location"
            content={
              <Typography variant="body2">
                <TextWithLinks text={eventLocation} />
              </Typography>
            }
          />
        )}

        <CalendarEventConferenceEntryPoints
          id={id}
          render={({ Icon, iconTooltip, content }) => (
            <LayoutRow Icon={Icon} iconTooltip={iconTooltip} content={content} />
          )}
        />

        {description && (
          <LayoutRow
            Icon={NotesIcon}
            iconTooltip="Description"
            BoxProps={{ mb: 3 }}
            content={
              <Typography
                variant="body2"
                component="div"
                className={classes.eventPopoverDescription}
                dangerouslySetInnerHTML={{
                  __html: parseHtml(description),
                }}
              />
            }
          />
        )}

        {attendeesRenderSubset && attendeesRenderSubset.length > 0 && (
          <>
            <LayoutRow
              iconTooltip="Attendees"
              Icon={GroupRoundedIcon}
              content={
                <Box component="ul" m={0} pl={2}>
                  {attendeesRenderSubset.map((attendee, index) => (
                    <Box component="li" key={attendee.id || attendee.email || index}>
                      <Typography
                        variant="body2"
                        style={{ display: 'flex', alignItems: 'center' }}
                        color={
                          attendee.responseStatus === 'declined' ? 'textSecondary' : 'textPrimary'
                        }
                      >
                        {attendee.displayName || attendee.email}{' '}
                        {attendee.organizer && (
                          <Typography component="span" variant="caption">
                            {' '}
                            &nbsp;(Organizer){' '}
                          </Typography>
                        )}
                        <AttendeeStatusIcon responseStatus={attendee.responseStatus} />
                      </Typography>
                    </Box>
                  ))}

                  {attendeesRenderSubset.length < attendees.length && <Box component="li">...</Box>}
                </Box>
              }
            />

            <LayoutRow
              iconTooltip="Attendance"
              Icon={HowToRegIcon}
              BoxProps={{ mb: 3 }}
              content={
                <Box minWidth={120}>
                  <InputLabel shrink id="attendance-select-label">
                    Going?
                  </InputLabel>
                  <Select
                    onChange={handleSelectChange}
                    value={calendarEventResponseStatus}
                    fullWidth
                    labelId="attendance-select-label"
                    disabled={isUpdating}
                  >
                    {calendarEventResponseStatus === RESPONSE_STATUS.NEEDS_ACTION && (
                      <MenuItem value={RESPONSE_STATUS.NEEDS_ACTION} disabled>
                        Not replied
                      </MenuItem>
                    )}

                    <MenuItem value={RESPONSE_STATUS.ACCEPTED}>Yes</MenuItem>

                    <MenuItem value={RESPONSE_STATUS.DECLINED}>No</MenuItem>

                    <MenuItem value={RESPONSE_STATUS.TENTATIVE}>Maybe</MenuItem>
                  </Select>
                </Box>
              }
            />
          </>
        )}

        {/* visibility is missing on GCal quite often */}
        {visibility && (
          <LayoutRow
            Icon={visibility === PUBLIC ? LockOpenRoundedIcon : LockRoundedIcon}
            iconTooltip="Visibility"
            content={
              <Typography variant="body2">
                <TextWithLinks text={getEventVisibilityLabel(visibility)} />
              </Typography>
            }
          />
        )}

        <LayoutRow
          Icon={
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
          }
          BoxProps={{ mr: 2, ml: -1.5, alignItems: 'center' }}
          iconTooltip="Open in Google Calendar"
          content={<Typography variant="body2">{`${providerCalendarId} `}</Typography>}
        />

        {taskId && (
          <DialogActions>
            {taskExists && (
              <Button
                variant="outlined"
                color="default"
                component={Link}
                to={{ pathname: getTaskPath(taskId), search: location.search }}
                onClick={onClose}
              >
                Edit Task
              </Button>
            )}

            {taskExists && (
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
            )}
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
